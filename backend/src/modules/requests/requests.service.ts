import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AssetsService } from '../assets/assets.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { ApproveRequestDto } from './dto/approve-request.dto';
import { RegisterAssetsDto } from './dto/register-assets.dto';
import { RequestStatus, ItemApprovalStatus, AllocationTarget, AssetStatus } from '@prisma/client';

@Injectable()
export class RequestsService {
  constructor(
    private prisma: PrismaService,
    private assetsService: AssetsService,
  ) {}

  /**
   * Generate request document number (RO-YYYY-MMDD-XXXX)
   */
  private async generateDocNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const prefix = `RO-${year}-${month}${day}-`;

    const lastRequest = await this.prisma.request.findFirst({
      where: { docNumber: { startsWith: prefix } },
      orderBy: { docNumber: 'desc' },
    });

    let sequence = 1;
    if (lastRequest) {
      const lastSequence = parseInt(lastRequest.docNumber.split('-').pop() || '0');
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Create new request with automatic stock validation
   * Implements logic from BACKEND_GUIDE.md Section 6.6.A
   */
  async create(createRequestDto: CreateRequestDto, requesterId: number) {
    const docNumber = await this.generateDocNumber();

    // Check stock availability for each item
    const itemsWithStatus = await Promise.all(
      createRequestDto.items.map(async item => {
        const stockCheck = await this.assetsService.checkAvailability(
          item.itemName,
          item.itemTypeBrand,
          item.quantity,
        );

        let status: ItemApprovalStatus;
        let reason: string;

        if (stockCheck.isSufficient) {
          status = ItemApprovalStatus.STOCK_ALLOCATED;
          reason = stockCheck.isFragmented
            ? 'Stok tersedia (terpecah di beberapa batch)'
            : 'Stok tersedia di gudang';
        } else {
          status = ItemApprovalStatus.PROCUREMENT_NEEDED;
          reason = `Stok kurang ${stockCheck.deficit} unit, perlu pengadaan`;
        }

        return {
          ...item,
          status,
          approvedQuantity: item.quantity,
          reason,
        };
      }),
    );

    // Determine initial request status
    const allStockAvailable = itemsWithStatus.every(
      item => item.status === ItemApprovalStatus.STOCK_ALLOCATED,
    );

    let initialStatus: RequestStatus;
    const allocationTarget = createRequestDto.allocationTarget || AllocationTarget.USAGE;

    if (allStockAvailable && createRequestDto.orderType === 'REGULAR_STOCK') {
      if (allocationTarget === AllocationTarget.INVENTORY) {
        // Restock request with available stock - unusual, complete immediately
        initialStatus = RequestStatus.COMPLETED;
      } else {
        // Usage request with available stock - ready for handover
        initialStatus = RequestStatus.AWAITING_HANDOVER;
      }
    } else {
      // Needs approval or procurement
      initialStatus = RequestStatus.PENDING;
    }

    // Create request with items
    const request = await this.prisma.request.create({
      data: {
        id: docNumber,
        docNumber,
        requesterId,
        division: createRequestDto.division,
        status: initialStatus,
        requestDate: new Date(createRequestDto.requestDate),
        orderType: createRequestDto.orderType,
        justification: createRequestDto.justification,
        project: createRequestDto.project,
        allocationTarget,
        items: {
          create: itemsWithStatus.map(item => ({
            itemName: item.itemName,
            itemTypeBrand: item.itemTypeBrand,
            quantity: item.quantity,
            unit: item.unit,
            status: item.status,
            approvedQuantity: item.approvedQuantity,
            reason: item.reason,
          })),
        },
      },
      include: {
        items: true,
        requester: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    // Log activity
    await this.prisma.activityLog.create({
      data: {
        entityType: 'Request',
        entityId: request.id,
        action: 'CREATE',
        changes: { status: initialStatus, itemCount: itemsWithStatus.length },
        performedBy: `User#${requesterId}`,
      },
    });

    return request;
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    status?: RequestStatus;
    requesterId?: number;
    division?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const { skip = 0, take = 50, status, requesterId, division, dateFrom, dateTo } = params || {};

    const where: any = {};

    if (status) where.status = status;
    if (requesterId) where.requesterId = requesterId;
    if (division) where.division = { contains: division, mode: 'insensitive' };

    if (dateFrom || dateTo) {
      where.requestDate = {};
      if (dateFrom) where.requestDate.gte = new Date(dateFrom);
      if (dateTo) where.requestDate.lte = new Date(dateTo);
    }

    const [requests, total] = await Promise.all([
      this.prisma.request.findMany({
        where,
        skip,
        take,
        include: {
          items: true,
          requester: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.request.count({ where }),
    ]);

    return { data: requests, total, skip, take };
  }

  async findOne(id: string) {
    const request = await this.prisma.request.findUnique({
      where: { id },
      include: {
        items: true,
        requester: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(`Request ${id} tidak ditemukan`);
    }

    return request;
  }

  async update(id: string, updateRequestDto: UpdateRequestDto) {
    await this.findOne(id);

    const { items, ...data } = updateRequestDto;

    return this.prisma.request.update({
      where: { id },
      data: {
        ...data,
        ...(items && {
          items: {
            deleteMany: {},
            createMany: {
              data: items,
            },
          },
        }),
      },
      include: { items: true },
    });
  }

  /**
   * Review/Approve request with partial approval support
   * Implements logic from BACKEND_GUIDE.md Section 6.6.B
   */
  async approveRequest(id: string, dto: ApproveRequestDto, approverName: string) {
    const request = await this.findOne(id);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Request tidak dalam status PENDING');
    }

    // Update item statuses
    const updatedItems = await Promise.all(
      request.items.map(async item => {
        const adjustment = dto.itemAdjustments?.[item.id];

        if (!adjustment) {
          return item; // No change
        }

        let status: ItemApprovalStatus;
        if (adjustment.approvedQuantity === 0) {
          status = ItemApprovalStatus.REJECTED;
        } else if (adjustment.approvedQuantity < item.quantity) {
          status = ItemApprovalStatus.PARTIAL;
        } else {
          status = ItemApprovalStatus.APPROVED;
        }

        return this.prisma.requestItem.update({
          where: { id: item.id },
          data: {
            status,
            approvedQuantity: adjustment.approvedQuantity,
            reason: adjustment.reason,
          },
        });
      }),
    );

    // Determine next status
    const allRejected = updatedItems.every(item => item.status === ItemApprovalStatus.REJECTED);

    let nextStatus: RequestStatus;
    if (allRejected) {
      nextStatus = RequestStatus.REJECTED;
    } else if (dto.approvalType === 'logistic') {
      nextStatus = RequestStatus.LOGISTIC_APPROVED;
    } else {
      nextStatus = RequestStatus.PURCHASE_APPROVED;
    }

    // Update request
    const updateData: any = {
      status: nextStatus,
    };

    if (dto.approvalType === 'logistic') {
      updateData.logisticApprover = approverName;
      updateData.logisticApprovalDate = new Date();
    } else {
      updateData.finalApprover = approverName;
      updateData.finalApprovalDate = new Date();
    }

    const updated = await this.prisma.request.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });

    // Log activity
    await this.prisma.activityLog.create({
      data: {
        entityType: 'Request',
        entityId: id,
        action: 'APPROVED',
        changes: { previousStatus: request.status, newStatus: nextStatus },
        performedBy: approverName,
      },
    });

    return updated;
  }

  /**
   * Register assets from approved request (Request to Asset conversion)
   * Implements logic from BACKEND_GUIDE.md Section 6.6.C
   */
  async registerAssets(id: string, dto: RegisterAssetsDto, performedBy: string) {
    const request = await this.findOne(id);

    const validStatuses: RequestStatus[] = [
      RequestStatus.ARRIVED,
      RequestStatus.PURCHASE_APPROVED,
      RequestStatus.LOGISTIC_APPROVED,
    ];

    if (!validStatuses.includes(request.status)) {
      throw new BadRequestException('Request belum siap untuk registrasi aset');
    }

    // Use transaction for atomic operation
    return this.prisma.$transaction(async tx => {
      const createdAssets = [];

      for (const assetData of dto.assets) {
        // Generate asset ID
        const year = new Date().getFullYear();
        const prefix = `AST-${year}-`;

        const lastAsset = await tx.asset.findFirst({
          where: { id: { startsWith: prefix } },
          orderBy: { id: 'desc' },
        });

        let sequence = 1;
        if (lastAsset) {
          const lastSeq = parseInt(lastAsset.id.split('-').pop() || '0');
          sequence = lastSeq + 1;
        }

        const assetId = `${prefix}${sequence.toString().padStart(4, '0')}`;

        const asset = await tx.asset.create({
          data: {
            id: assetId,
            name: assetData.name,
            brand: assetData.brand,
            serialNumber: assetData.serialNumber,
            status: AssetStatus.IN_STORAGE,
            location: 'Gudang',
            woRoIntNumber: request.id,
            purchasePrice: assetData.purchasePrice,
            purchaseDate: assetData.purchaseDate ? new Date(assetData.purchaseDate) : null,
            vendor: assetData.vendor,
          },
        });

        createdAssets.push(asset);
      }

      // Update registration tracking
      const currentPartial = (request.partiallyRegisteredItems as Record<string, number>) || {};

      for (const assetData of dto.assets) {
        const itemId = assetData.requestItemId?.toString();
        if (itemId) {
          currentPartial[itemId] = (currentPartial[itemId] || 0) + 1;
        }
      }

      // Check if fully registered
      const totalApproved = request.items.reduce(
        (sum, item) => sum + (item.approvedQuantity || item.quantity),
        0,
      );
      const totalRegistered = Object.values(currentPartial).reduce((sum, v) => sum + v, 0);
      const isFullyRegistered = totalRegistered >= totalApproved;

      await tx.request.update({
        where: { id },
        data: {
          partiallyRegisteredItems: currentPartial,
          isRegistered: isFullyRegistered,
          status: isFullyRegistered ? RequestStatus.AWAITING_HANDOVER : request.status,
        },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          entityType: 'Request',
          entityId: id,
          action: 'ASSETS_REGISTERED',
          changes: { assetsCreated: createdAssets.length, isFullyRegistered },
          performedBy,
        },
      });

      return {
        success: true,
        registeredAssets: createdAssets,
        isFullyRegistered,
      };
    });
  }

  async reject(id: string, reason: string, rejectedBy: string) {
    const request = await this.findOne(id);

    if (request.status === RequestStatus.REJECTED || request.status === RequestStatus.COMPLETED) {
      throw new BadRequestException('Request sudah dalam status final');
    }

    return this.prisma.request.update({
      where: { id },
      data: {
        status: RequestStatus.REJECTED,
        rejectedBy,
        rejectionReason: reason,
        rejectionDate: new Date(),
      },
    });
  }

  async markArrived(id: string) {
    await this.findOne(id);

    return this.prisma.request.update({
      where: { id },
      data: { status: RequestStatus.ARRIVED },
    });
  }

  async complete(id: string) {
    await this.findOne(id);

    return this.prisma.request.update({
      where: { id },
      data: { status: RequestStatus.COMPLETED },
    });
  }
}
