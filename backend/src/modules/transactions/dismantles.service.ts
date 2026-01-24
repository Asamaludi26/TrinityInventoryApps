import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateDismantleDto } from './dto/create-dismantle.dto';
import { CompleteDismantleDto } from './dto/complete-dismantle.dto';
import { ItemStatus, AssetStatus, Prisma } from '@prisma/client';

@Injectable()
export class DismantlesService {
  constructor(private prisma: PrismaService) {}

  private async generateDocNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `DSM-${year}-${month}-`;

    const last = await this.prisma.dismantle.findFirst({
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

  async create(dto: CreateDismantleDto) {
    const docNumber = await this.generateDocNumber();

    return this.prisma.dismantle.create({
      data: {
        docNumber,
        dismantleDate: new Date(dto.dismantleDate),
        assetId: dto.assetId,
        assetName: dto.assetName,
        customerId: dto.customerId,
        customerName: dto.customerName,
        customerAddress: dto.customerAddress || '',
        technicianId: dto.technicianId,
        technicianName: dto.technicianName,
        retrievedCondition: dto.retrievedCondition,
        status: ItemStatus.PENDING,
        notes: dto.notes,
      },
    });
  }

  async findAll(params?: { skip?: number; take?: number; status?: ItemStatus }) {
    const { skip = 0, take = 50, status } = params || {};

    /**
     * PERBAIKAN BARIS 55:
     * Menggunakan 'Prisma.DismantleWhereInput' menggantikan 'any'.
     * Ini memberikan validasi tipe yang ketat untuk filtering database.
     */
    const where: Prisma.DismantleWhereInput = {};

    if (status) {
      where.status = status;
    }

    const [dismantles, total] = await Promise.all([
      this.prisma.dismantle.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dismantle.count({ where }),
    ]);

    return { data: dismantles, total, skip, take };
  }

  async findOne(id: string) {
    const dismantle = await this.prisma.dismantle.findUnique({
      where: { id },
    });

    if (!dismantle) {
      throw new NotFoundException(`Dismantle ${id} tidak ditemukan`);
    }

    return dismantle;
  }

  async complete(id: string, dto: CompleteDismantleDto, acknowledgerName: string) {
    const dismantle = await this.findOne(id);

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update dismantle status
      await tx.dismantle.update({
        where: { id },
        data: {
          status: ItemStatus.COMPLETED,
          acknowledgerName,
        },
      });

      // Update asset back to storage based on retrieved condition
      const condition = dto.assetConditions?.[dismantle.assetId];
      await tx.asset.update({
        where: { id: dismantle.assetId },
        data: {
          status: condition === 'DAMAGED' ? AssetStatus.DAMAGED : AssetStatus.IN_STORAGE,
          location: 'Gudang',
          isDismantled: true,
        },
      });

      return this.findOne(id);
    });
  }
}
