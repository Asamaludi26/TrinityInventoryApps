import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateHandoverDto } from './dto/create-handover.dto';
import { ItemStatus, AssetStatus, Prisma } from '@prisma/client';

@Injectable()
export class HandoversService {
  constructor(private prisma: PrismaService) {}

  private async generateDocNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `HO-${year}-${month}-`;

    const last = await this.prisma.handover.findFirst({
      where: { docNumber: { startsWith: prefix } },
      orderBy: { docNumber: 'desc' },
    });

    let seq = 1;
    if (last) {
      const lastSeq = parseInt(last.docNumber.split('-').pop() || '0');
      seq = lastSeq + 1;
    }

    return `${prefix}${seq.toString().padStart(4, '0')}`;
  }

  async create(dto: CreateHandoverDto) {
    const docNumber = await this.generateDocNumber();

    // Create handover with items
    const handover = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Filter items that have assetIds for asset validation
      const assetIds = dto.items
        .map(i => i.assetId)
        .filter((id): id is string => id !== undefined && id !== null);

      let assetMap = new Map<
        string,
        { id: string; status: string; name: string; brand: string | null }
      >();

      if (assetIds.length > 0) {
        const assets = await tx.asset.findMany({
          where: {
            id: { in: assetIds },
          },
          select: { id: true, status: true, name: true, brand: true },
        });

        // Check all asset IDs exist
        const foundIds = new Set(assets.map(a => a.id));
        const missingIds = assetIds.filter(id => !foundIds.has(id));
        if (missingIds.length > 0) {
          throw new BadRequestException(`Asset tidak ditemukan: ${missingIds.join(', ')}`);
        }

        // Check all assets are available (IN_STORAGE)
        const unavailableAssets = assets.filter(a => a.status !== AssetStatus.IN_STORAGE);
        if (unavailableAssets.length > 0) {
          throw new BadRequestException(
            `Asset tidak tersedia untuk handover (status bukan IN_STORAGE): ${unavailableAssets.map(a => a.id).join(', ')}`,
          );
        }

        // Create asset map for easy lookup
        assetMap = new Map(assets.map(a => [a.id, a]));
      }

      const ho = await tx.handover.create({
        data: {
          docNumber,
          handoverDate: new Date(dto.handoverDate),
          menyerahkanId: dto.menyerahkanId,
          menyerahkanName: dto.menyerahkanName,
          penerimaId: dto.penerimaId,
          penerimaName: dto.penerimaName,
          mengetahuiId: dto.mengetahuiId,
          mengetahuiName: dto.mengetahuiName,
          woRoIntNumber: dto.woRoIntNumber,
          status: dto.status || ItemStatus.COMPLETED,
          items: {
            create: dto.items.map(item => {
              const asset = item.assetId ? assetMap.get(item.assetId) : undefined;
              return {
                assetId: item.assetId || null,
                itemName: item.itemName || asset?.name || 'Unknown Item',
                itemTypeBrand: item.itemTypeBrand || asset?.brand || '',
                conditionNotes: item.conditionNotes || 'Baik',
                quantity: item.quantity || 1,
                unit: item.unit,
              };
            }),
          },
        },
        include: { items: { include: { asset: true } } },
      });

      // Update asset statuses only for items with asset IDs
      if (assetIds.length > 0) {
        await tx.asset.updateMany({
          where: { id: { in: assetIds } },
          data: { status: AssetStatus.IN_USE },
        });
      }

      // Log activity
      await tx.activityLog.create({
        data: {
          entityType: 'Handover',
          entityId: docNumber,
          action: 'CREATED',
          userId: dto.menyerahkanId,
          userName: dto.menyerahkanName,
          details: JSON.stringify({
            assetIds,
            receiver: dto.penerimaName,
          }),
        },
      });

      return ho;
    });

    return handover;
  }

  async findAll(params?: { skip?: number; take?: number }) {
    const { skip = 0, take = 50 } = params || {};

    const [handovers, total] = await Promise.all([
      this.prisma.handover.findMany({
        skip,
        take,
        include: { items: { include: { asset: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.handover.count(),
    ]);

    return { data: handovers, total, skip, take };
  }

  async findOne(id: string) {
    const handover = await this.prisma.handover.findUnique({
      where: { id },
      include: { items: { include: { asset: true } } },
    });

    if (!handover) {
      throw new NotFoundException(`Handover ${id} tidak ditemukan`);
    }

    return handover;
  }
}
