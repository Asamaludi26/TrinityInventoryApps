import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { MaintenanceStatus, AssetStatus } from '@prisma/client';

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

    return this.prisma.$transaction(async tx => {
      const maintenance = await tx.maintenance.create({
        data: {
          id: docNumber,
          docNumber,
          maintenanceDate: new Date(dto.maintenanceDate),
          assetId: dto.assetId,
          type: dto.type,
          status: MaintenanceStatus.IN_PROGRESS,
          problemDescription: dto.problemDescription,
          technician: dto.technician,
          materialsUsed: dto.materialsUsed || [],
          notes: dto.notes,
        },
        include: { asset: true },
      });

      // Update asset status
      await tx.asset.update({
        where: { id: dto.assetId },
        data: { status: AssetStatus.UNDER_REPAIR },
      });

      return maintenance;
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    status?: MaintenanceStatus;
    assetId?: string;
  }) {
    const { skip = 0, take = 50, status, assetId } = params || {};

    const where: any = {};
    if (status) where.status = status;
    if (assetId) where.assetId = assetId;

    const [maintenances, total] = await Promise.all([
      this.prisma.maintenance.findMany({
        where,
        skip,
        take,
        include: { asset: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.maintenance.count({ where }),
    ]);

    return { data: maintenances, total, skip, take };
  }

  async findOne(id: string) {
    const maintenance = await this.prisma.maintenance.findUnique({
      where: { id },
      include: { asset: true },
    });

    if (!maintenance) {
      throw new NotFoundException(`Maintenance ${id} tidak ditemukan`);
    }

    return maintenance;
  }

  async complete(id: string, actionTaken: string, laborCost?: number, partsCost?: number) {
    const maintenance = await this.findOne(id);

    return this.prisma.$transaction(async tx => {
      // Update maintenance
      await tx.maintenance.update({
        where: { id },
        data: {
          status: MaintenanceStatus.COMPLETED,
          actionTaken,
          laborCost,
          partsCost,
          completedDate: new Date(),
        },
      });

      // Restore asset status
      await tx.asset.update({
        where: { id: maintenance.assetId },
        data: { status: AssetStatus.IN_STORAGE },
      });

      return this.findOne(id);
    });
  }
}
