import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AssetsService } from '../assets/assets.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { ApproveRequestDto } from './dto/approve-request.dto';
import { RegisterAssetsDto } from './dto/register-assets.dto';
import {
  ItemStatus,
  ItemApprovalStatus,
  AllocationTarget,
  AssetStatus,
  Prisma,
  OrderType,
} from '@prisma/client';

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
    if (lastRequest && lastRequest.docNumber) {
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

    // Get requester info
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
      include: { division: true },
    });

    if (!requester) {
      throw new NotFoundException('Requester tidak ditemukan');
    }

    // Check stock availability for each item
    const itemsWithStatus = await Promise.all(
      createRequestDto.items.map(async item => {
        const stockCheck = await this.assetsService.checkAvailability(
          item.itemName,
          item.itemTypeBrand,
          item.quantity,
        );

        let approvalStatus: ItemApprovalStatus;
        let reason: string;

        if (stockCheck.isSufficient) {
          approvalStatus = ItemApprovalStatus.STOCK_ALLOCATED;
          reason = stockCheck.isFragmented
            ? 'Stok tersedia (terpecah di beberapa batch)'
            : 'Stok tersedia di gudang';
        } else {
          approvalStatus = ItemApprovalStatus.PROCUREMENT_NEEDED;
          reason = `Stok kurang ${stockCheck.deficit} unit, perlu pengadaan`;
        }

        return {
          ...item,
          approvalStatus,
          approvedQuantity: item.quantity,
          rejectionReason: reason,
          keterangan: item.keterangan || '', // Required field
        };
      }),
    );

    // Determine initial request status (use ItemStatus, not RequestStatus)
    const allStockAvailable = itemsWithStatus.every(
      item => item.approvalStatus === ItemApprovalStatus.STOCK_ALLOCATED,
    );

    let initialStatus: ItemStatus;
    const allocationTarget = createRequestDto.allocationTarget || AllocationTarget.USAGE;
    const orderType = createRequestDto.orderType || OrderType.REGULAR_STOCK;

    if (allStockAvailable && orderType === OrderType.REGULAR_STOCK) {
      if (allocationTarget === AllocationTarget.INVENTORY) {
        // Restock request with available stock - unusual, complete immediately
        initialStatus = ItemStatus.COMPLETED;
      } else {
        // Usage request with available stock - ready for handover
        initialStatus = ItemStatus.AWAITING_HANDOVER;
      }
    } else {
      // Needs approval or procurement
      initialStatus = ItemStatus.PENDING;
    }

    // Create request with items - use correct field names
    const request = await this.prisma.request.create({
      data: {
        id: docNumber,
        docNumber,
        requesterId,
        requesterName: requester.name,
        divisionId: requester.divisionId || 0,
        divisionName: requester.division?.name || 'Unknown',
        status: initialStatus,
        requestDate: new Date(createRequestDto.requestDate),
        orderType: orderType,
        justification: createRequestDto.justification,
        projectName: createRequestDto.project,
        allocationTarget,
        items: {
          create: itemsWithStatus.map(item => ({
            itemName: item.itemName,
            itemTypeBrand: item.itemTypeBrand,
            quantity: item.quantity,
            unit: item.unit || '',
            keterangan: item.keterangan,
            approvalStatus: item.approvalStatus,
            approvedQuantity: item.approvedQuantity,
            rejectionReason: item.rejectionReason,
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
        details: JSON.stringify({
          status: initialStatus,
          itemCount: itemsWithStatus.length,
        }),
        userId: requesterId,
        userName: requester.name,
      },
    });

    return request;
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    status?: ItemStatus;
    requesterId?: number;
    division?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const { skip = 0, take = 50, status, requesterId, division, dateFrom, dateTo } = params || {};

    /**
     * PERBAIKAN BARIS 181:
     * Menggunakan Prisma.RequestWhereInput menggantikan 'any'.
     */
    const where: Prisma.RequestWhereInput = {};

    if (status) where.status = status;
    if (requesterId) where.requesterId = requesterId;
    if (division) where.divisionName = { contains: division, mode: 'insensitive' }; // division -> divisionName sesuai logic string search

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

    // Transform items to ensure keterangan has a default value (required by schema)
    const transformedItems = items?.map(item => ({
      ...item,
      keterangan: item.keterangan || '',
    }));

    return this.prisma.request.update({
      where: { id },
      data: {
        ...data,
        ...(transformedItems && {
          items: {
            deleteMany: {},
            createMany: {
              data: transformedItems,
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

    if (request.status !== ItemStatus.PENDING) {
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
            approvalStatus: status,
            approvedQuantity: adjustment.approvedQuantity,
            rejectionReason: adjustment.reason,
          },
        });
      }),
    );

    // Determine next status
    const allRejected = updatedItems.every(
      item => item.approvalStatus === ItemApprovalStatus.REJECTED,
    );

    let nextStatus: ItemStatus;
    if (allRejected) {
      nextStatus = ItemStatus.REJECTED;
    } else if (dto.approvalType === 'logistic') {
      nextStatus = ItemStatus.LOGISTIC_APPROVED;
    } else {
      nextStatus = ItemStatus.APPROVED;
    }

    /**
     * PERBAIKAN BARIS 313:
     * Menggunakan 'Prisma.RequestUpdateInput' dan conditional spread
     * untuk menentukan field update secara type-safe.
     */
    const updateData: Prisma.RequestUpdateInput = {
      status: nextStatus,
      // Gunakan conditional object spread untuk menentukan field mana yang diisi
      ...(dto.approvalType === 'logistic'
        ? {
            logisticApproverName: approverName,
            logisticApprovalDate: new Date(),
          }
        : {
            finalApproverName: approverName,
            finalApprovalDate: new Date(),
          }),
    };

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
        details: JSON.stringify({
          previousStatus: request.status,
          newStatus: nextStatus,
        }),
        userId: 0, // TODO: Get user ID from context
        userName: approverName,
      },
    });

    return updated;
  }

  /**
   * Register assets from approved request (Request to Asset conversion)
   * Implements logic from BACKEND_GUIDE.md Section 6.6.C
   */
  async registerAssets(
    id: string,
    dto: RegisterAssetsDto,
    performedById: number,
    performedBy: string,
  ) {
    const request = await this.findOne(id);

    const validStatuses: ItemStatus[] = [
      ItemStatus.ARRIVED,
      ItemStatus.APPROVED,
      ItemStatus.LOGISTIC_APPROVED,
    ];

    if (!validStatuses.includes(request.status)) {
      throw new BadRequestException('Request belum siap untuk registrasi aset');
    }

    // Use transaction for atomic operation
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

        // Asset requires: condition, category, recordedBy
        const asset = await tx.asset.create({
          data: {
            id: assetId,
            name: assetData.name,
            brand: assetData.brand,
            serialNumber: assetData.serialNumber,
            status: AssetStatus.IN_STORAGE,
            condition: 'GOOD', // Default condition
            location: 'Gudang',
            woRoIntNumber: request.id,
            purchasePrice: assetData.purchasePrice,
            purchaseDate: assetData.purchaseDate ? new Date(assetData.purchaseDate) : null,
            vendor: assetData.vendor,
            categoryId: assetData.categoryId || 1, // Required field
            recordedById: performedById, // Required field
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
          status: isFullyRegistered ? ItemStatus.AWAITING_HANDOVER : request.status,
        },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          entityType: 'Request',
          entityId: id,
          action: 'ASSETS_REGISTERED',
          details: JSON.stringify({
            assetsCreated: createdAssets.length,
            isFullyRegistered,
          }),
          userId: performedById,
          userName: performedBy,
        },
      });

      return {
        success: true,
        registeredAssets: createdAssets,
        isFullyRegistered,
      };
    });
  }

  async reject(id: string, reason: string, rejectedById: number, rejectedByName: string) {
    const request = await this.findOne(id);

    if (request.status === ItemStatus.REJECTED || request.status === ItemStatus.COMPLETED) {
      throw new BadRequestException('Request sudah dalam status final');
    }

    return this.prisma.request.update({
      where: { id },
      data: {
        status: ItemStatus.REJECTED,
        rejectedById,
        rejectedByName,
        rejectionReason: reason,
        rejectionDate: new Date(),
      },
    });
  }

  async markArrived(id: string) {
    await this.findOne(id);

    return this.prisma.request.update({
      where: { id },
      data: { status: ItemStatus.ARRIVED },
    });
  }

  async complete(id: string) {
    await this.findOne(id);

    return this.prisma.request.update({
      where: { id },
      data: { status: ItemStatus.COMPLETED },
    });
  }

  /**
   * Cancel a request (user-initiated cancellation)
   * Only PENDING requests can be cancelled
   */
  async cancel(id: string, reason: string, cancelledById: number, cancelledByName: string) {
    const request = await this.findOne(id);

    // Only PENDING requests can be cancelled
    if (request.status !== ItemStatus.PENDING) {
      throw new BadRequestException(
        `Request tidak dapat dibatalkan karena status sudah ${request.status}`,
      );
    }

    const updated = await this.prisma.request.update({
      where: { id },
      data: {
        status: ItemStatus.REJECTED,
        rejectedById: cancelledById,
        rejectedByName: cancelledByName,
        rejectionReason: reason || 'Dibatalkan oleh pengguna',
        rejectionDate: new Date(),
      },
      include: {
        items: true,
        requester: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Log activity
    await this.prisma.activityLog.create({
      data: {
        entityType: 'Request',
        entityId: id,
        action: 'CANCELLED',
        details: JSON.stringify({
          status: { old: ItemStatus.PENDING, new: ItemStatus.REJECTED },
          reason: reason || 'Dibatalkan oleh pengguna',
        }),
        userId: cancelledById,
        userName: cancelledByName,
      },
    });

    return updated;
  }
}
