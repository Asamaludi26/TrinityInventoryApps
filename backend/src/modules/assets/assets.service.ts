import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAssetDto, CreateBulkAssetsDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { ConsumeStockDto } from './dto/consume-stock.dto';
import { AssetStatus, MovementType, Prisma } from '@prisma/client';

// Helper type untuk menangani field tambahan yang mungkin di-inject dari Controller
type ExtendedAssetDto = CreateAssetDto & {
  recordedById?: number;
  performedBy?: string;
  notes?: string;
};

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Strip unknown fields from asset DTO to prevent Prisma validation errors.
   */
  private sanitizeAssetData(
    dto: Partial<CreateAssetDto | UpdateAssetDto>,
  ): Prisma.AssetUncheckedCreateInput {
    const allowedFields = [
      'name',
      'brand',
      'typeId',
      'categoryId',
      'serialNumber',
      'macAddress',
      'status',
      'condition',
      'initialBalance',
      'currentBalance',
      'quantity',
      'location',
      'locationDetail',
      'purchasePrice',
      'purchaseDate',
      'vendor',
      'poNumber',
      'invoiceNumber',
      'warrantyEndDate',
      'woRoIntNumber',
      'customerId',
      'currentUserId',
      'recordedById',
    ];

    const sanitized: Record<string, unknown> = {};
    const source = dto as Record<string, unknown>;

    for (const field of allowedFields) {
      if (source[field] !== undefined) {
        sanitized[field] = source[field];
      }
    }

    return sanitized as Prisma.AssetUncheckedCreateInput;
  }

  /**
   * Generate unique asset ID (AST-YYYY-XXXX)
   */
  private async generateAssetId(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `AST-${year}-`;

    const lastAsset = await this.prisma.asset.findFirst({
      where: { id: { startsWith: prefix } },
      orderBy: { id: 'desc' },
    });

    let sequence = 1;
    if (lastAsset) {
      const lastSeq = parseInt(lastAsset.id.split('-').pop() || '0');
      sequence = lastSeq + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  async create(createAssetDto: CreateAssetDto) {
    const id = createAssetDto.id || (await this.generateAssetId());
    const sanitized = this.sanitizeAssetData(createAssetDto);

    const createData: Prisma.AssetUncheckedCreateInput = {
      ...sanitized,
      id,
      categoryId: sanitized.categoryId || 1,
      recordedById: sanitized.recordedById || 0,
    };

    const asset = await this.prisma.asset.create({
      data: createData,
      include: { type: true, category: true },
    });

    const dtoWithMeta = createAssetDto as ExtendedAssetDto;

    await this.prisma.stockMovement.create({
      data: {
        assetName: asset.name,
        brand: asset.brand,
        type: MovementType.IN_PURCHASE,
        quantity: createAssetDto.quantity || 1,
        balanceAfter: createAssetDto.quantity || 1,
        actorId: dtoWithMeta.recordedById || 0,
        actorName: 'SYSTEM',
        notes: 'Asset registered',
        relatedAssetId: asset.id,
      },
    });

    return asset;
  }

  async createBulk(dto: CreateBulkAssetsDto) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const assets: Prisma.AssetCreateManyInput[] = [];

      // Validate all types exist
      const typeIds = [
        ...new Set(
          dto.items
            .map(i => {
              /**
               * PERBAIKAN UTAMA DI SINI:
               * Kita tambahkan 'typeId?: number' ke dalam intersection type.
               * Ini memberi tahu TypeScript: "Objek ini punya modelId (opsional) DAN typeId (opsional)"
               * terlepas dari apakah CreateAssetDto aslinya memilikinya atau tidak.
               */
              const item = i as CreateAssetDto & {
                modelId?: number;
                typeId?: number;
              };
              return item.typeId || item.modelId;
            })
            .filter((id): id is number => !!id),
        ),
      ];

      if (typeIds.length > 0) {
        const existingTypes = await tx.assetType.findMany({
          where: { id: { in: typeIds } },
          select: { id: true },
        });
        const existingTypeIds = new Set(existingTypes.map(t => t.id));
        const missingTypes = typeIds.filter(id => !existingTypeIds.has(id));
        if (missingTypes.length > 0) {
          throw new BadRequestException(`Type tidak ditemukan: ${missingTypes.join(', ')}`);
        }
      }

      // Check serial number uniqueness
      const serialNumbers = dto.items.map(i => i.serialNumber).filter(Boolean);
      if (serialNumbers.length > 0) {
        const existingSerials = await tx.asset.findMany({
          where: { serialNumber: { in: serialNumbers as string[] } },
          select: { serialNumber: true },
        });
        if (existingSerials.length > 0) {
          throw new BadRequestException(
            `Serial number sudah terdaftar: ${existingSerials.map(a => a.serialNumber).join(', ')}`,
          );
        }
      }

      const dtoWithMeta = dto as unknown as ExtendedAssetDto;

      for (const item of dto.items) {
        const id = await this.generateAssetId();
        const sanitized = this.sanitizeAssetData(item);
        assets.push({
          ...sanitized,
          id,
          categoryId: sanitized.categoryId || 1,
          recordedById: dtoWithMeta.recordedById || 0,
        });
      }

      await tx.asset.createMany({
        data: assets,
      });

      // Log movements
      await tx.stockMovement.createMany({
        data: assets.map(asset => ({
          assetName: asset.name || 'Unknown',
          brand: asset.brand || 'Unknown',
          type: MovementType.IN_PURCHASE,
          quantity: asset.quantity || 1,
          balanceAfter: asset.quantity || 1,
          actorId: dtoWithMeta.recordedById || 0,
          actorName: dtoWithMeta.performedBy || 'SYSTEM',
          notes: dtoWithMeta.notes || 'Bulk asset registration',
          relatedAssetId: asset.id,
        })),
      });

      return { created: assets.length, ids: assets.map(a => a.id) };
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    status?: AssetStatus;
    name?: string;
    brand?: string;
    location?: string;
    search?: string;
  }) {
    const { skip = 0, take = 50, status, name, brand, location, search } = params || {};

    const where: Prisma.AssetWhereInput = {};

    if (status) where.status = status;
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (brand) where.brand = { contains: brand, mode: 'insensitive' };
    if (location) where.location = { contains: location, mode: 'insensitive' };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [assets, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        skip,
        take,
        include: { type: true, category: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.asset.count({ where }),
    ]);

    return { data: assets, total, skip, take };
  }

  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        type: {
          include: { category: true },
        },
        category: true,
        maintenances: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!asset) {
      throw new NotFoundException(`Asset ${id} tidak ditemukan`);
    }

    return asset;
  }

  async update(id: string, updateAssetDto: UpdateAssetDto) {
    await this.findOne(id);
    const sanitized = this.sanitizeAssetData(updateAssetDto);

    return this.prisma.asset.update({
      where: { id },
      data: sanitized as Prisma.AssetUpdateInput,
      include: { type: true, category: true },
    });
  }

  async updateStatus(id: string, status: AssetStatus, performedBy: string) {
    const asset = await this.findOne(id);
    const previousStatus = asset.status;

    const updated = await this.prisma.asset.update({
      where: { id },
      data: { status },
    });

    await this.prisma.activityLog.create({
      data: {
        entityType: 'Asset',
        entityId: id,
        action: 'STATUS_CHANGE',
        details: JSON.stringify({
          status: { old: previousStatus, new: status },
        }),
        userId: 0,
        userName: performedBy,
        assetId: id,
      },
    });

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.asset.update({
      where: { id },
      data: { status: AssetStatus.DECOMMISSIONED },
    });
  }

  async checkAvailability(name: string, brand: string, quantity: number) {
    const assets = await this.prisma.asset.findMany({
      where: {
        name: { equals: name, mode: 'insensitive' },
        brand: { equals: brand, mode: 'insensitive' },
        status: AssetStatus.IN_STORAGE,
      },
    });

    let totalAvailable = 0;
    const availableAssets: string[] = [];

    for (const asset of assets) {
      if (asset.currentBalance !== null) {
        totalAvailable += asset.currentBalance.toNumber();
      } else if (asset.quantity !== null) {
        totalAvailable += asset.quantity;
      } else {
        totalAvailable += 1;
      }
      availableAssets.push(asset.id);
    }

    return {
      isSufficient: totalAvailable >= quantity,
      available: totalAvailable,
      requested: quantity,
      deficit: Math.max(0, quantity - totalAvailable),
      assetIds: availableAssets,
      isFragmented: assets.length > 1,
    };
  }

  async consumeStock(dto: ConsumeStockDto) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const results = [];

      for (const item of dto.items) {
        const assets = await tx.asset.findMany({
          where: {
            name: { equals: item.itemName, mode: 'insensitive' },
            brand: { equals: item.brand, mode: 'insensitive' },
            status: AssetStatus.IN_STORAGE,
          },
          orderBy: { currentBalance: 'desc' },
        });

        let remaining = item.quantity;

        for (const asset of assets) {
          if (remaining <= 0) break;

          if (asset.currentBalance !== null) {
            const currentBalanceNum = asset.currentBalance.toNumber();
            const consume = Math.min(currentBalanceNum, remaining);
            const newBalance = currentBalanceNum - consume;

            await tx.asset.update({
              where: { id: asset.id },
              data: {
                currentBalance: newBalance,
                status: newBalance === 0 ? AssetStatus.CONSUMED : AssetStatus.IN_STORAGE,
              },
            });

            await tx.stockMovement.create({
              data: {
                assetName: asset.name,
                brand: asset.brand,
                type: MovementType.OUT_USAGE_CUSTODY,
                quantity: consume,
                balanceAfter: newBalance,
                actorId: 0,
                actorName: dto.context.technician || 'SYSTEM',
                notes: `${dto.context.referenceType}: ${dto.context.referenceId}`,
                relatedAssetId: asset.id,
              },
            });

            remaining -= consume;
            results.push({ assetId: asset.id, consumed: consume });
          }
        }

        if (remaining > 0) {
          throw new BadRequestException(
            `Stok tidak cukup untuk ${item.itemName} ${item.brand}. Kurang: ${remaining} ${item.unit}`,
          );
        }
      }

      return { success: true, consumed: results };
    });
  }

  async getStockMovements(params?: {
    assetName?: string;
    brand?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { assetName, brand, type: movementType, startDate, endDate } = params || {};

    const where: Prisma.StockMovementWhereInput = {};

    if (movementType) {
      where.type = movementType as MovementType;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (assetName) {
      where.assetName = { contains: assetName, mode: 'insensitive' };
    }
    if (brand) {
      where.brand = { contains: brand, mode: 'insensitive' };
    }

    const movements = await this.prisma.stockMovement.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 100,
      include: {
        relatedAsset: {
          select: { id: true, name: true, brand: true },
        },
      },
    });

    return movements.map(m => ({
      ...m,
      asset: m.relatedAsset,
    }));
  }

  async getStockSummary() {
    const assets = await this.prisma.asset.findMany({
      where: {
        status: AssetStatus.IN_STORAGE,
      },
      select: {
        name: true,
        brand: true,
        quantity: true,
        currentBalance: true,
      },
    });

    const summary: Record<string, { name: string; brand: string; total: number; count: number }> =
      {};

    for (const asset of assets) {
      const key = `${asset.name}|${asset.brand}`;
      if (!summary[key]) {
        summary[key] = {
          name: asset.name,
          brand: asset.brand,
          total: 0,
          count: 0,
        };
      }

      if (asset.currentBalance !== null) {
        summary[key].total += asset.currentBalance.toNumber();
      } else if (asset.quantity !== null) {
        summary[key].total += asset.quantity;
      } else {
        summary[key].total += 1;
      }
      summary[key].count += 1;
    }

    return Object.values(summary);
  }
}
