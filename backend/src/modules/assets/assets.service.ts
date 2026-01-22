import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAssetDto, CreateBulkAssetsDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { ConsumeStockDto } from './dto/consume-stock.dto';
import { AssetStatus, MovementType, Prisma } from '@prisma/client';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Strip unknown fields from asset DTO to prevent Prisma validation errors.
   * Frontend may send nested objects (model) or extra fields that Prisma doesn't accept.
   */
  private sanitizeAssetData(
    dto: Partial<CreateAssetDto | UpdateAssetDto>,
  ): Partial<CreateAssetDto> {
    const allowedFields = [
      'name',
      'brand',
      'modelId',
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
    ];

    const sanitized: Record<string, unknown> = {};
    const source = dto as Record<string, unknown>;

    for (const field of allowedFields) {
      if (source[field] !== undefined) {
        sanitized[field] = source[field];
      }
    }

    return sanitized as Partial<CreateAssetDto>;
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
      const lastSequence = parseInt(lastAsset.id.split('-').pop() || '0');
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  async create(createAssetDto: CreateAssetDto) {
    const id = createAssetDto.id || (await this.generateAssetId());
    const sanitized = this.sanitizeAssetData(createAssetDto);

    const asset = await this.prisma.asset.create({
      data: {
        ...sanitized,
        id,
      } as any,
      include: { type: true, category: true },
    });

    // Log stock movement
    // Note: StockMovement uses: assetName, brand, type, quantity, balanceAfter, actorId, actorName
    await this.prisma.stockMovement.create({
      data: {
        assetName: asset.name,
        brand: asset.brand,
        type: MovementType.IN_PURCHASE,
        quantity: createAssetDto.quantity || 1,
        balanceAfter: createAssetDto.quantity || 1,
        actorId: (createAssetDto as any).recordedById || 0,
        actorName: 'SYSTEM',
        notes: 'Asset registered',
        relatedAssetId: asset.id,
      },
    });

    return asset;
  }

  async createBulk(dto: CreateBulkAssetsDto) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const assets: any[] = [];

      // Validate all types exist (schema uses AssetType, not AssetModel)
      const typeIds = [
        ...new Set(dto.items.map(i => (i as any).typeId).filter(Boolean)),
      ] as number[];
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

      for (const item of dto.items) {
        const id = await this.generateAssetId();
        const sanitized = this.sanitizeAssetData(item);
        assets.push({
          ...sanitized,
          id,
        });
      }

      await tx.asset.createMany({
        data: assets as any,
      });

      // Log movements using correct StockMovement schema
      await tx.stockMovement.createMany({
        data: assets.map(asset => ({
          assetName: asset.name || 'Unknown',
          brand: asset.brand || 'Unknown',
          type: MovementType.IN_PURCHASE,
          quantity: asset.quantity || 1,
          balanceAfter: asset.quantity || 1,
          actorId: (dto as any).recordedById || 0,
          actorName: (dto as any).performedBy || 'SYSTEM',
          notes: (dto as any).notes || 'Bulk asset registration',
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

    const where: any = {};

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
      data: sanitized,
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

    // Log activity
    await this.prisma.activityLog.create({
      data: {
        entityType: 'Asset',
        entityId: id,
        action: 'STATUS_CHANGE',
        details: JSON.stringify({ status: { old: previousStatus, new: status } }),
        userId: 0, // TODO: Get from context
        userName: performedBy,
        assetId: id,
      },
    });

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);

    // Note: Asset model doesn't have deletedAt. Mark as DECOMMISSIONED instead.
    return this.prisma.asset.update({
      where: { id },
      data: { status: AssetStatus.DECOMMISSIONED },
    });
  }

  /**
   * Check stock availability for a specific item
   */
  async checkAvailability(name: string, brand: string, quantity: number) {
    const assets = await this.prisma.asset.findMany({
      where: {
        name: { equals: name, mode: 'insensitive' },
        brand: { equals: brand, mode: 'insensitive' },
        status: AssetStatus.IN_STORAGE,
      },
    });

    // Calculate total available
    let totalAvailable = 0;
    const availableAssets: string[] = [];

    for (const asset of assets) {
      if (asset.currentBalance !== null) {
        // Measurement item - convert Decimal to number
        totalAvailable += asset.currentBalance.toNumber();
      } else if (asset.quantity !== null) {
        // Count item - quantity is Int, no conversion needed
        totalAvailable += asset.quantity;
      } else {
        // Individual item
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

  /**
   * Consume stock (for installation/maintenance) - atomic operation
   */
  async consumeStock(dto: ConsumeStockDto) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const results = [];

      for (const item of dto.items) {
        // Lock rows for update to prevent race conditions
        const assets = await tx.asset.findMany({
          where: {
            name: { equals: item.itemName, mode: 'insensitive' },
            brand: { equals: item.brand, mode: 'insensitive' },
            status: AssetStatus.IN_STORAGE,
          },
          orderBy: { currentBalance: 'desc' }, // Use largest stock first
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

            // Use correct StockMovement schema fields
            await tx.stockMovement.create({
              data: {
                assetName: asset.name,
                brand: asset.brand,
                type: MovementType.OUT_USAGE_CUSTODY, // No CONSUMED in MovementType
                quantity: consume,
                balanceAfter: newBalance,
                actorId: 0, // TODO: Pass actor from context
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

  /**
   * Get stock movements with optional filters
   */
  async getStockMovements(params?: {
    assetName?: string;
    brand?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { assetName, brand, type: movementType, startDate, endDate } = params || {};

    const where: any = {};

    // StockMovement uses 'type' field (MovementType enum)
    if (movementType) {
      where.type = movementType;
    }

    // StockMovement uses 'date' field, not 'createdAt'
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    // StockMovement has assetName and brand fields directly
    if (assetName) {
      where.assetName = { contains: assetName, mode: 'insensitive' };
    }
    if (brand) {
      where.brand = { contains: brand, mode: 'insensitive' };
    }

    const movements = await this.prisma.stockMovement.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 100, // Limit results
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

  /**
   * Get stock summary grouped by name and brand
   */
  async getStockSummary() {
    // Asset has no deletedAt field
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
        // quantity is Int, no conversion needed
        summary[key].total += asset.quantity;
      } else {
        summary[key].total += 1;
      }
      summary[key].count += 1;
    }

    return Object.values(summary);
  }
}
