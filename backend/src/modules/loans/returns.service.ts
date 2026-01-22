import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { ProcessReturnDto } from './dto/process-return.dto';
import {
  AssetReturnStatus,
  LoanRequestStatus,
  AssetStatus,
  Prisma,
  ReturnItemStatus,
  AssetCondition,
} from '@prisma/client';

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

  async create(dto: CreateReturnDto, returnerId: number, returnerName: string) {
    const docNumber = await this.generateDocNumber();

    // Verify loan exists
    const loan = await this.prisma.loanRequest.findUnique({
      where: { id: dto.loanRequestId },
      include: { assetAssignments: true },
    });

    if (!loan) {
      throw new NotFoundException('Loan request tidak ditemukan');
    }

    // Validate loan status - can only return if ON_LOAN
    if (loan.status !== LoanRequestStatus.ON_LOAN) {
      throw new BadRequestException(
        `Tidak dapat membuat return untuk loan dengan status ${loan.status}. ` +
          `Status harus ON_LOAN`,
      );
    }

    // Validate asset ownership - all items must belong to the loan's assigned assets
    const assignedAssetIds = new Set(loan.assetAssignments.map(a => a.assetId));

    const invalidItems = dto.items.filter(item => {
      // Check if asset was assigned to this loan
      if (!assignedAssetIds.has(item.assetId)) return true;
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
        docNumber,
        loanRequestId: dto.loanRequestId,
        status: AssetReturnStatus.PENDING_APPROVAL,
        returnDate: new Date(dto.returnDate),
        returnedById: returnerId,
        returnedByName: returnerName,
        items: {
          create: dto.items.map(item => ({
            asset: { connect: { id: item.assetId } },
            returnedCondition: (item.returnedCondition ||
              item.condition ||
              'GOOD') as AssetCondition,
            notes: item.notes,
            status: ReturnItemStatus.PENDING,
          })),
        },
      },
      include: {
        loanRequest: true,
        items: true,
      },
    });
  }

  async findAll(loanRequestId?: string) {
    const where: any = {};
    if (loanRequestId) where.loanRequestId = loanRequestId;

    return this.prisma.assetReturn.findMany({
      where,
      include: { loanRequest: true, items: true },
      orderBy: { returnDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const ret = await this.prisma.assetReturn.findUnique({
      where: { id },
      include: { loanRequest: true, items: true },
    });

    if (!ret) {
      throw new NotFoundException(`Return ${id} tidak ditemukan`);
    }

    return ret;
  }

  /**
   * Process return batch - implements BACKEND_GUIDE.md Section 6.7
   */
  async processReturn(id: string, dto: ProcessReturnDto, verifierId: number, verifierName: string) {
    const returnDoc = await this.findOne(id);

    if (returnDoc.status !== AssetReturnStatus.PENDING_APPROVAL) {
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

      // Update return document with correct fields
      await tx.assetReturn.update({
        where: { id },
        data: {
          status: AssetReturnStatus.COMPLETED,
          verifiedById: verifierId,
          verifiedByName: verifierName,
          verificationDate: new Date(),
        },
      });

      // Update loan request - add returned assets
      // LoanRequest uses 'returnedAssetIds' as Json field
      const loan = await tx.loanRequest.findUnique({
        where: { id: returnDoc.loanRequestId },
        include: { assetAssignments: true },
      });

      const currentReturned = (loan?.returnedAssetIds as string[]) || [];
      const newReturned = [...currentReturned, ...dto.acceptedAssetIds];

      // Check if all assets returned based on assignments
      const totalAssigned = loan?.assetAssignments.length || 0;
      const allReturned = newReturned.length >= totalAssigned;

      await tx.loanRequest.update({
        where: { id: returnDoc.loanRequestId },
        data: {
          returnedAssetIds: newReturned,
          status: allReturned ? LoanRequestStatus.RETURNED : LoanRequestStatus.ON_LOAN,
        },
      });

      return { success: true, allReturned };
    });
  }

  /**
   * Update return document (partial update)
   */
  async update(id: string, data: any, updatedBy: string) {
    const returnDoc = await this.findOne(id);

    // Only allow updates to PENDING_APPROVAL returns (AssetReturnStatus has no PENDING)
    if (returnDoc.status !== AssetReturnStatus.PENDING_APPROVAL && !data.status) {
      throw new BadRequestException('Return yang sudah diproses tidak dapat diupdate');
    }

    const updated = await this.prisma.assetReturn.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: { loanRequest: true },
    });

    // Log activity - ActivityLog uses 'details' not 'changes', 'userName' not 'performedBy'
    await this.prisma.activityLog.create({
      data: {
        entityType: 'AssetReturn',
        entityId: id,
        action: 'UPDATED',
        details: JSON.stringify(data),
        userId: 0, // TODO: Get actual user ID from context
        userName: updatedBy,
      },
    });

    return updated;
  }

  /**
   * Verify return - alternative to processReturn with different payload format
   * Supports frontend's verify endpoint expectations
   */
  async verifyReturn(
    id: string,
    dto: { acceptedAssetIds?: string[]; verifiedBy?: string; notes?: string },
    userName: string,
  ) {
    const returnDoc = await this.findOne(id);

    if (returnDoc.status !== AssetReturnStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Return sudah diverifikasi');
    }

    const acceptedAssetIds = dto.acceptedAssetIds || [];
    const verifiedByName = dto.verifiedBy || userName;

    // Get all item asset IDs from return document
    const returnItems = (returnDoc.items as any[]) || [];
    const allAssetIds = returnItems.map(item => item.assetId);
    const rejectedAssetIds = allAssetIds.filter(id => !acceptedAssetIds.includes(id));

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update accepted assets to IN_STORAGE
      if (acceptedAssetIds.length > 0) {
        await tx.asset.updateMany({
          where: { id: { in: acceptedAssetIds } },
          data: {
            status: AssetStatus.IN_STORAGE,
            currentUserId: null,
            location: 'Gudang',
          },
        });
      }

      // Update rejected assets to IN_USE (still with borrower)
      if (rejectedAssetIds.length > 0) {
        await tx.asset.updateMany({
          where: { id: { in: rejectedAssetIds } },
          data: { status: AssetStatus.IN_USE },
        });
      }

      // Determine final status
      const allAccepted = rejectedAssetIds.length === 0;
      const allRejected = acceptedAssetIds.length === 0;
      const finalStatus = allRejected
        ? AssetReturnStatus.REJECTED
        : allAccepted
          ? AssetReturnStatus.COMPLETED
          : AssetReturnStatus.APPROVED;

      // Update return document - verifiedBy is a relation, use verifiedById/Name instead
      // Note: AssetReturn doesn't have a notes field
      const updated = await tx.assetReturn.update({
        where: { id },
        data: {
          status: finalStatus,
          verifiedByName: verifiedByName,
          verificationDate: new Date(),
        },
        include: { loanRequest: true },
      });

      // Update loan request - add returned assets
      const loan = await tx.loanRequest.findUnique({
        where: { id: returnDoc.loanRequestId },
        include: { assetAssignments: true },
      });

      if (loan && acceptedAssetIds.length > 0) {
        const currentReturned = (loan.returnedAssetIds as string[]) || [];
        const newReturned = [...currentReturned, ...acceptedAssetIds];

        // Check if all assets returned based on assignments
        const totalAssigned = loan.assetAssignments.length;
        const allReturned = newReturned.length >= totalAssigned;

        await tx.loanRequest.update({
          where: { id: returnDoc.loanRequestId },
          data: {
            returnedAssetIds: newReturned,
            status: allReturned ? LoanRequestStatus.RETURNED : LoanRequestStatus.ON_LOAN,
            actualReturnDate: allReturned ? new Date() : loan.actualReturnDate,
          },
        });
      }

      // Log activity - use correct fields
      await tx.activityLog.create({
        data: {
          entityType: 'AssetReturn',
          entityId: id,
          action: 'VERIFIED',
          details: JSON.stringify({
            acceptedCount: acceptedAssetIds.length,
            rejectedCount: rejectedAssetIds.length,
            finalStatus,
          }),
          userId: 0, // TODO: Get actual user ID
          userName: verifiedByName,
        },
      });

      return updated;
    });
  }
}
