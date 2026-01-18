import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateHandoverDto } from './dto/create-handover.dto';
import { HandoverStatus, AssetStatus } from '@prisma/client';

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
    const handover = await this.prisma.$transaction(async tx => {
      const ho = await tx.handover.create({
        data: {
          id: docNumber,
          docNumber,
          handoverDate: new Date(dto.handoverDate),
          giverName: dto.giverName,
          giverType: dto.giverType,
          receiverName: dto.receiverName,
          receiverType: dto.receiverType,
          status: HandoverStatus.COMPLETED,
          notes: dto.notes,
          items: {
            create: dto.items.map(item => ({
              assetId: item.assetId,
              quantity: item.quantity || 1,
              notes: item.notes,
            })),
          },
        },
        include: { items: { include: { asset: true } } },
      });

      // Update asset statuses
      const assetIds = dto.items.map(i => i.assetId);
      await tx.asset.updateMany({
        where: { id: { in: assetIds } },
        data: { status: AssetStatus.IN_USE },
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
