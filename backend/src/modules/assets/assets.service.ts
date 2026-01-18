import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateAssetDto, CreateBulkAssetsDto } from "./dto/create-asset.dto";
import { UpdateAssetDto } from "./dto/update-asset.dto";
import { ConsumeStockDto } from "./dto/consume-stock.dto";
import { AssetStatus, MovementType } from "@prisma/client";

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate unique asset ID (AST-YYYY-XXXX)
   */
  private async generateAssetId(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `AST-${year}-`;

    const lastAsset = await this.prisma.asset.findFirst({
      where: { id: { startsWith: prefix } },
      orderBy: { id: "desc" },
    });

    let sequence = 1;
    if (lastAsset) {
      const lastSequence = parseInt(lastAsset.id.split("-").pop() || "0");
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, "0")}`;
  }

  async create(createAssetDto: CreateAssetDto) {
    const id = createAssetDto.id || (await this.generateAssetId());

    const asset = await this.prisma.asset.create({
      data: {
        ...createAssetDto,
        id,
      },
      include: { model: true },
    });

    // Log stock movement
    await this.prisma.stockMovement.create({
      data: {
        assetId: asset.id,
        movementType: MovementType.RECEIVED,
        quantity: createAssetDto.quantity || 1,
        unit: "Unit",
        referenceType: "REGISTRATION",
        performedBy: "SYSTEM",
        notes: "Asset registered",
      },
    });

    return asset;
  }

  async createBulk(dto: CreateBulkAssetsDto) {
    const assets = [];

    for (const item of dto.items) {
      const id = await this.generateAssetId();
      assets.push({
        ...item,
        id,
      });
    }

    await this.prisma.asset.createMany({
      data: assets,
    });

    // Log movements
    await this.prisma.stockMovement.createMany({
      data: assets.map((asset) => ({
        assetId: asset.id,
        movementType: MovementType.RECEIVED,
        quantity: asset.quantity || 1,
        unit: "Unit",
        referenceType: "BULK_REGISTRATION",
        performedBy: dto.performedBy || "SYSTEM",
        notes: dto.notes || "Bulk asset registration",
      })),
    });

    return { created: assets.length, ids: assets.map((a) => a.id) };
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    status?: AssetStatus;
    name?: string;
    brand?: string;
    location?: string;
    customerId?: string;
    search?: string;
  }) {
    const {
      skip = 0,
      take = 50,
      status,
      name,
      brand,
      location,
      customerId,
      search,
    } = params || {};

    const where: any = {
      deletedAt: null,
    };

    if (status) where.status = status;
    if (name) where.name = { contains: name, mode: "insensitive" };
    if (brand) where.brand = { contains: brand, mode: "insensitive" };
    if (location) where.location = { contains: location, mode: "insensitive" };
    if (customerId) where.customerId = customerId;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { serialNumber: { contains: search, mode: "insensitive" } },
        { id: { contains: search, mode: "insensitive" } },
      ];
    }

    const [assets, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        skip,
        take,
        include: { model: true },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.asset.count({ where }),
    ]);

    return { data: assets, total, skip, take };
  }

  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        model: {
          include: { type: { include: { category: true } } },
        },
        maintenances: {
          orderBy: { createdAt: "desc" },
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

    return this.prisma.asset.update({
      where: { id },
      data: updateAssetDto,
      include: { model: true },
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
        entityType: "Asset",
        entityId: id,
        action: "STATUS_CHANGE",
        changes: { status: { old: previousStatus, new: status } },
        performedBy,
      },
    });

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.asset.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Check stock availability for a specific item
   */
  async checkAvailability(name: string, brand: string, quantity: number) {
    const assets = await this.prisma.asset.findMany({
      where: {
        name: { equals: name, mode: "insensitive" },
        brand: { equals: brand, mode: "insensitive" },
        status: AssetStatus.IN_STORAGE,
        deletedAt: null,
      },
    });

    // Calculate total available
    let totalAvailable = 0;
    const availableAssets: string[] = [];

    for (const asset of assets) {
      if (asset.currentBalance !== null) {
        // Measurement item
        totalAvailable += asset.currentBalance;
      } else if (asset.quantity !== null) {
        // Count item
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
   * Consume stock (for installation/maintenance)
   */
  async consumeStock(dto: ConsumeStockDto) {
    const results = [];

    for (const item of dto.items) {
      const assets = await this.prisma.asset.findMany({
        where: {
          name: { equals: item.itemName, mode: "insensitive" },
          brand: { equals: item.brand, mode: "insensitive" },
          status: AssetStatus.IN_STORAGE,
          deletedAt: null,
        },
        orderBy: { currentBalance: "desc" }, // Use largest stock first
      });

      let remaining = item.quantity;

      for (const asset of assets) {
        if (remaining <= 0) break;

        if (asset.currentBalance !== null) {
          const consume = Math.min(asset.currentBalance, remaining);
          const newBalance = asset.currentBalance - consume;

          await this.prisma.asset.update({
            where: { id: asset.id },
            data: { currentBalance: newBalance },
          });

          await this.prisma.stockMovement.create({
            data: {
              assetId: asset.id,
              movementType: MovementType.CONSUMED,
              quantity: consume,
              unit: item.unit,
              previousBalance: asset.currentBalance,
              newBalance,
              referenceType: dto.context.referenceType,
              referenceId: dto.context.referenceId,
              performedBy: dto.context.technician || "SYSTEM",
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
  }

  /**
   * Get stock summary grouped by name and brand
   */
  async getStockSummary() {
    const assets = await this.prisma.asset.findMany({
      where: {
        status: AssetStatus.IN_STORAGE,
        deletedAt: null,
      },
      select: {
        name: true,
        brand: true,
        quantity: true,
        currentBalance: true,
      },
    });

    const summary: Record<
      string,
      { name: string; brand: string; total: number; count: number }
    > = {};

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
        summary[key].total += asset.currentBalance;
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
