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
            /**
             * PERBAIKAN LINE 46:
             * Menghapus ': any'. Kita definisikan tipe inline jika DTO belum ketat,
             * atau biarkan TypeScript menginferensikan dari CreateInstallationDto.
             * Di sini saya beri type hint eksplisit agar aman.
             */
            connect: dto.assetsInstalled.map((a: { assetId: string }) => ({
              id: a.assetId,
            })),
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

      /**
       * PERBAIKAN LINE 63:
       * Menghapus ': any' dan menggunakan type hint yang sama.
       */
      const assetIds = dto.assetsInstalled.map((a: { assetId: string }) => a.assetId);

      // Update installed asset statuses
      if (assetIds.length > 0) {
        await tx.asset.updateMany({
          where: { id: { in: assetIds } },
          data: {
            status: AssetStatus.IN_USE,
          },
        });
      }

      return installation;
    });
  }

  async findAll(params?: { skip?: number; take?: number; customerId?: string }) {
    const { skip = 0, take = 50, customerId } = params || {};

    /**
     * PERBAIKAN LINE 78:
     * Menggunakan 'Prisma.InstallationWhereInput' alih-alih 'any'.
     * Ini menjamin type safety untuk query filter.
     */
    const where: Prisma.InstallationWhereInput = {};

    if (customerId) {
      where.customerId = customerId;
    }

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
