import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateInstallationDto } from './dto/create-installation.dto';
import { ItemStatus, AssetStatus, Prisma } from '@prisma/client';

@Injectable()
export class InstallationsService {
  constructor(private prisma: PrismaService) {}

  private async generateDocNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `INST-${year}-${month}-`;

    const last = await this.prisma.installation.findFirst({
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

  async create(dto: CreateInstallationDto) {
    const docNumber = await this.generateDocNumber();

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create installation record
      const installation = await tx.installation.create({
        data: {
          docNumber,
          installationDate: new Date(dto.installDate),
          customerId: dto.customerId,
          customerName: dto.customerName,
          technicianId: dto.technicianId,
          technicianName: dto.technicianName,
          status: ItemStatus.COMPLETED,
          notes: dto.notes || '',
          assetsInstalled: {
            connect: dto.assetsInstalled.map((a: any) => ({ id: a.assetId })),
          },
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
        include: { assetsInstalled: true, materialsUsed: true },
      });

      // Update installed asset statuses
      const assetIds = dto.assetsInstalled.map((a: any) => a.assetId);
      await tx.asset.updateMany({
        where: { id: { in: assetIds } },
        data: {
          status: AssetStatus.IN_USE,
        },
      });

      return installation;
    });
  }

  async findAll(params?: { skip?: number; take?: number; customerId?: string }) {
    const { skip = 0, take = 50, customerId } = params || {};

    const where: any = {};
    if (customerId) where.customerId = customerId;

    const [installations, total] = await Promise.all([
      this.prisma.installation.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.installation.count({ where }),
    ]);

    return { data: installations, total, skip, take };
  }

  async findOne(id: string) {
    const installation = await this.prisma.installation.findUnique({
      where: { id },
    });

    if (!installation) {
      throw new NotFoundException(`Installation ${id} tidak ditemukan`);
    }

    return installation;
  }
}
