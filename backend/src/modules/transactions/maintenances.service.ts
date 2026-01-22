import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { ItemStatus, AssetStatus, Prisma } from '@prisma/client';

@Injectable()
export class MaintenancesService {
  constructor(private prisma: PrismaService) {}

  private async generateDocNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `MNT-${year}-${month}-`;

    const last = await this.prisma.maintenance.findFirst({
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

  async create(dto: CreateMaintenanceDto) {
    const docNumber = await this.generateDocNumber();

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const maintenance = await tx.maintenance.create({
        data: {
          docNumber,
          maintenanceDate: new Date(dto.maintenanceDate),
          customerId: dto.customerId,
          customerName: dto.customerName || '',
          technicianId: dto.technicianId,
          technicianName: dto.technicianName,
          status: ItemStatus.IN_PROGRESS,
          problemDescription: dto.problemDescription || '',
          actionsTaken: '',
          workTypes: dto.workTypes || [],
          notes: dto.notes,
          materialsUsed: dto.materialsUsed?.length
            ? {
                create: dto.materialsUsed.map(m => ({
                  itemName: m.itemName,
                  brand: m.brand || '',
                  quantity: m.quantity,
                  unit: m.unit || 'pcs',
                })),
              }
            : undefined,
        },
        include: { assets: true, materialsUsed: true },
      });

      return maintenance;
    });
  }

  async findAll(params?: { skip?: number; take?: number; status?: ItemStatus; assetId?: string }) {
    const { skip = 0, take = 50, status } = params || {};

    const where: any = {};
    if (status) where.status = status;

    const [maintenances, total] = await Promise.all([
      this.prisma.maintenance.findMany({
        where,
        skip,
        take,
        include: { assets: true, materialsUsed: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.maintenance.count({ where }),
    ]);

    return { data: maintenances, total, skip, take };
  }

  async findOne(id: string) {
    const maintenance = await this.prisma.maintenance.findUnique({
      where: { id },
      include: { assets: true, materialsUsed: true },
    });

    if (!maintenance) {
      throw new NotFoundException(`Maintenance ${id} tidak ditemukan`);
    }

    return maintenance;
  }

  async complete(id: string, actionsTaken: string, laborCost?: number, partsCost?: number) {
    await this.findOne(id);

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update maintenance
      const updated = await tx.maintenance.update({
        where: { id },
        data: {
          status: ItemStatus.COMPLETED,
          actionsTaken,
          completionDate: new Date(),
        },
        include: { assets: true },
      });

      // Restore asset statuses for all assets in this maintenance
      for (const asset of updated.assets) {
        await tx.asset.update({
          where: { id: asset.id },
          data: { status: AssetStatus.IN_STORAGE },
        });
      }

      return this.findOne(id);
    });
  }
}
