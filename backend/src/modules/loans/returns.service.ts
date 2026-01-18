import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { ProcessReturnDto } from './dto/process-return.dto';
import { AssetReturnStatus, LoanStatus, AssetStatus, Prisma } from '@prisma/client';

@Injectable()
export class ReturnsService {
  constructor(private prisma: PrismaService) {}

  private async generateDocNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `RTN-${year}-${month}-`;

    const lastReturn = await this.prisma.assetReturn.findFirst({
      where: { docNumber: { startsWith: prefix } },
      orderBy: { docNumber: 'desc' },
    });

    let sequence = 1;
    if (lastReturn) {
      const lastSeq = parseInt(lastReturn.docNumber.split('-').pop() || '0');
      sequence = lastSeq + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  async create(dto: CreateReturnDto) {
    const docNumber = await this.generateDocNumber();

    // Verify loan exists
    const loan = await this.prisma.loanRequest.findUnique({
      where: { id: dto.loanRequestId },
    });

    if (!loan) {
      throw new NotFoundException('Loan request tidak ditemukan');
    }

    // Validate loan status - can only return if ON_LOAN
    // Note: Partially returned loans are still ON_LOAN until all assets are returned
    if (loan.status !== LoanStatus.ON_LOAN) {
      throw new BadRequestException(
        `Tidak dapat membuat return untuk loan dengan status ${loan.status}. ` +
          `Status harus ON_LOAN`,
      );
    }

    // Validate asset ownership - all items must belong to the loan's assigned assets
    const assignedAssets = (loan.assignedAssets as Record<string, string[]>) || {};
    const allAssignedIds = new Set(Object.values(assignedAssets).flat());
    const returnedAssets = new Set(loan.returnedAssets || []);

    const invalidItems = dto.items.filter(item => {
      // Check if asset was assigned to this loan
      if (!allAssignedIds.has(item.assetId)) return true;
      // Check if asset was already returned
      if (returnedAssets.has(item.assetId)) return true;
      return false;
    });

    if (invalidItems.length > 0) {
      const invalidIds = invalidItems.map(i => i.assetId);
      throw new BadRequestException(
        `Asset berikut tidak valid untuk return: ${invalidIds.join(', ')}. ` +
          `Asset mungkin tidak di-assign ke loan ini atau sudah dikembalikan.`,
      );
    }

    return this.prisma.assetReturn.create({
      data: {
        id: docNumber,
        docNumber,
        loanRequestId: dto.loanRequestId,
        status: AssetReturnStatus.PENDING,
        returnDate: new Date(dto.returnDate),
        items: dto.items.map(item => ({ ...item })),
      },
      include: {
        loanRequest: true,
      },
    });
  }

  async findAll(loanRequestId?: string) {
    const where: any = {};
    if (loanRequestId) where.loanRequestId = loanRequestId;

    return this.prisma.assetReturn.findMany({
      where,
      include: { loanRequest: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const ret = await this.prisma.assetReturn.findUnique({
      where: { id },
      include: { loanRequest: true },
    });

    if (!ret) {
      throw new NotFoundException(`Return ${id} tidak ditemukan`);
    }

    return ret;
  }

  /**
   * Process return batch - implements BACKEND_GUIDE.md Section 6.7
   */
  async processReturn(id: string, dto: ProcessReturnDto, processedBy: string) {
    const returnDoc = await this.findOne(id);

    if (returnDoc.status !== AssetReturnStatus.PENDING) {
      throw new BadRequestException('Return sudah diproses');
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update accepted assets to IN_STORAGE
      if (dto.acceptedAssetIds.length > 0) {
        await tx.asset.updateMany({
          where: { id: { in: dto.acceptedAssetIds } },
          data: {
            status: AssetStatus.IN_STORAGE,
            currentUserId: null,
            location: 'Gudang',
          },
        });
      }

      // Update rejected assets (back to IN_USE or DAMAGED)
      if (dto.rejectedAssetIds && dto.rejectedAssetIds.length > 0) {
        await tx.asset.updateMany({
          where: { id: { in: dto.rejectedAssetIds } },
          data: { status: AssetStatus.DAMAGED },
        });
      }

      // Update return document
      await tx.assetReturn.update({
        where: { id },
        data: {
          status: AssetReturnStatus.APPROVED,
          processedBy,
          processedDate: new Date(),
        },
      });

      // Update loan request - add returned assets
      const loan = await tx.loanRequest.findUnique({
        where: { id: returnDoc.loanRequestId },
      });

      const currentReturned = loan?.returnedAssets || [];
      const newReturned = [...currentReturned, ...dto.acceptedAssetIds];

      // Check if all assets returned
      const assignedAssets = (loan?.assignedAssets as Record<string, string[]>) || {};
      const totalAssigned = Object.values(assignedAssets).flat().length;
      const allReturned = newReturned.length >= totalAssigned;

      await tx.loanRequest.update({
        where: { id: returnDoc.loanRequestId },
        data: {
          returnedAssets: newReturned,
          status: allReturned ? LoanStatus.RETURNED : LoanStatus.ON_LOAN,
        },
      });

      return { success: true, allReturned };
    });
  }
}
