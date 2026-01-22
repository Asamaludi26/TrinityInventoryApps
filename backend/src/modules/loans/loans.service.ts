import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { ApproveLoanDto } from './dto/approve-loan.dto';
import { SubmitReturnDto } from './dto/submit-return.dto';
import { LoanRequestStatus, AssetStatus, Prisma } from '@prisma/client';

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a unique loan request ID in format RL-YYYY-MM-XXXX
   * LoanRequest model uses 'id' as the document number (cuid by default, but we override)
   */
  private async generateLoanId(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `RL-${year}-${month}-`;

    const lastLoan = await this.prisma.loanRequest.findFirst({
      where: { id: { startsWith: prefix } },
      orderBy: { id: 'desc' },
    });

    let sequence = 1;
    if (lastLoan) {
      const lastSeq = parseInt(lastLoan.id.split('-').pop() || '0');
      sequence = lastSeq + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  async create(dto: CreateLoanDto, requesterId: number) {
    const loanId = await this.generateLoanId();

    // Get requester info
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
      select: { id: true, name: true, divisionId: true, division: { select: { name: true } } },
    });

    if (!requester) {
      throw new NotFoundException('Requester tidak ditemukan');
    }

    return this.prisma.loanRequest.create({
      data: {
        id: loanId,
        requesterId,
        requesterName: requester.name,
        divisionId: requester.divisionId || 0,
        divisionName: requester.division?.name || 'Unknown',
        status: LoanRequestStatus.PENDING,
        requestDate: new Date(dto.requestDate),
        notes: dto.purpose,
        items: {
          create: dto.items.map(item => ({
            itemName: item.itemName,
            brand: item.brand || '',
            quantity: item.quantity,
            unit: item.unit || '',
            keterangan: item.keterangan || '',
            returnDate: item.returnDate ? new Date(item.returnDate) : null,
          })),
        },
      },
      include: {
        requester: {
          select: { id: true, name: true, email: true },
        },
        items: true,
      },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    status?: LoanRequestStatus;
    requesterId?: number;
  }) {
    const { skip = 0, take = 50, status, requesterId } = params || {};

    const where: any = {};
    if (status) where.status = status;
    if (requesterId) where.requesterId = requesterId;

    const [loans, total] = await Promise.all([
      this.prisma.loanRequest.findMany({
        where,
        skip,
        take,
        include: {
          requester: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.loanRequest.count({ where }),
    ]);

    return { data: loans, total, skip, take };
  }

  async findOne(id: string) {
    const loan = await this.prisma.loanRequest.findUnique({
      where: { id },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        items: true,
        returns: true,
      },
    });

    if (!loan) {
      throw new NotFoundException(`Loan request ${id} tidak ditemukan`);
    }

    return loan;
  }

  async approve(id: string, dto: ApproveLoanDto, approverId: number, approverName: string) {
    const loan = await this.findOne(id);

    if (loan.status !== LoanRequestStatus.PENDING) {
      throw new BadRequestException('Loan request tidak dalam status PENDING');
    }

    // Validate and update asset statuses
    const allAssetIds = Object.values(dto.assignedAssetIds).flat();

    if (allAssetIds.length === 0) {
      throw new BadRequestException('Minimal satu asset harus di-assign');
    }

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Validate all assets exist and are available
      const assets = await tx.asset.findMany({
        where: {
          id: { in: allAssetIds },
        },
        select: { id: true, status: true },
      });

      // Check all asset IDs exist
      const foundIds = new Set(assets.map(a => a.id));
      const missingIds = allAssetIds.filter(id => !foundIds.has(id));
      if (missingIds.length > 0) {
        throw new BadRequestException(`Asset tidak ditemukan: ${missingIds.join(', ')}`);
      }

      // Check all assets are available (IN_STORAGE)
      const unavailableAssets = assets.filter(a => a.status !== AssetStatus.IN_STORAGE);
      if (unavailableAssets.length > 0) {
        throw new BadRequestException(
          `Asset tidak tersedia (status bukan IN_STORAGE): ${unavailableAssets.map(a => a.id).join(', ')}`,
        );
      }

      // Update asset statuses to IN_CUSTODY (loaned out)
      await tx.asset.updateMany({
        where: { id: { in: allAssetIds } },
        data: { status: AssetStatus.IN_CUSTODY },
      });

      // Update loan request - using correct schema fields
      await tx.loanRequest.update({
        where: { id },
        data: {
          status: LoanRequestStatus.ON_LOAN,
          approverId: approverId,
          approverName: approverName,
          approvalDate: new Date(),
        },
      });

      // Create asset assignments
      for (const assetId of allAssetIds) {
        await tx.loanAssetAssignment.create({
          data: {
            loanRequestId: id,
            loanItemId: 1, // TODO: Map to actual item
            assetId: assetId,
          },
        });
      }

      // Log activity with correct fields
      await tx.activityLog.create({
        data: {
          entityType: 'LoanRequest',
          entityId: id,
          action: 'APPROVED',
          details: JSON.stringify({
            status: { old: LoanRequestStatus.PENDING, new: LoanRequestStatus.ON_LOAN },
            assignedAssets: allAssetIds,
          }),
          userId: approverId,
          userName: approverName,
        },
      });
    });

    return this.findOne(id);
  }

  async reject(id: string, reason: string, rejectorId: number, rejectorName: string) {
    const loan = await this.findOne(id);

    // Validate status - can only reject PENDING loans
    if (loan.status !== LoanRequestStatus.PENDING) {
      throw new BadRequestException(
        `Loan request tidak dapat di-reject karena status sudah ${loan.status}`,
      );
    }

    const updated = await this.prisma.loanRequest.update({
      where: { id },
      data: {
        status: LoanRequestStatus.REJECTED,
        rejectionReason: reason,
      },
    });

    // Log activity with correct fields
    await this.prisma.activityLog.create({
      data: {
        entityType: 'LoanRequest',
        entityId: id,
        action: 'REJECTED',
        details: JSON.stringify({
          status: { old: LoanRequestStatus.PENDING, new: LoanRequestStatus.REJECTED },
          reason,
        }),
        userId: rejectorId,
        userName: rejectorName,
      },
    });

    return updated;
  }

  /**
   * Delete a loan request (only PENDING or REJECTED can be deleted)
   */
  async delete(id: string, deletorId: number, deletorName: string) {
    const loan = await this.findOne(id);

    // Only allow deletion of PENDING or REJECTED requests
    const deletableStatuses: LoanRequestStatus[] = [
      LoanRequestStatus.PENDING,
      LoanRequestStatus.REJECTED,
    ];
    if (!deletableStatuses.includes(loan.status)) {
      throw new BadRequestException(
        `Loan request tidak dapat dihapus karena status ${loan.status}`,
      );
    }

    // Delete the loan request
    await this.prisma.loanRequest.delete({
      where: { id },
    });

    // Log activity with correct fields
    await this.prisma.activityLog.create({
      data: {
        entityType: 'LoanRequest',
        entityId: id,
        action: 'DELETED',
        details: JSON.stringify({ previousStatus: loan.status }),
        userId: deletorId,
        userName: deletorName,
      },
    });

    return { success: true, message: `Loan request ${id} berhasil dihapus` };
  }

  /**
   * Submit return for a loan request
   * Creates a return document and updates asset statuses
   */
  async submitReturn(id: string, dto: SubmitReturnDto, returnerId: number, returnerName: string) {
    const loan = await this.findOne(id);

    // Validate loan is in ON_LOAN status
    if (loan.status !== LoanRequestStatus.ON_LOAN) {
      throw new BadRequestException(
        `Loan request tidak dalam status ON_LOAN (status saat ini: ${loan.status})`,
      );
    }

    // Generate return document number
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `RR-${year}-${month}-`;

    const lastReturn = await this.prisma.assetReturn.findFirst({
      where: { docNumber: { startsWith: prefix } },
      orderBy: { docNumber: 'desc' },
    });

    let sequence = 1;
    if (lastReturn) {
      const lastSeq = parseInt(lastReturn.docNumber.split('-').pop() || '0');
      sequence = lastSeq + 1;
    }

    const docNumber = `${prefix}${sequence.toString().padStart(4, '0')}`;

    // Create return document - using correct AssetReturn schema
    const { AssetReturnStatus } = await import('@prisma/client');
    const assetReturn = await this.prisma.assetReturn.create({
      data: {
        docNumber,
        loanRequestId: id,
        returnedById: returnerId,
        returnedByName: returnerName,
        returnDate: dto.returnDate ? new Date(dto.returnDate) : now,
        status: AssetReturnStatus.PENDING_APPROVAL,
        items: {
          create: dto.items.map(item => ({
            assetId: item.assetId,
            returnedCondition: item.returnedCondition || item.condition || 'GOOD',
            notes: item.notes,
            status: 'PENDING',
          })),
        },
      },
    });

    // Update asset statuses to AWAITING_RETURN
    const assetIds = dto.items.map(item => item.assetId);
    await this.prisma.asset.updateMany({
      where: { id: { in: assetIds } },
      data: { status: AssetStatus.AWAITING_RETURN },
    });

    // Log activity with correct fields
    await this.prisma.activityLog.create({
      data: {
        entityType: 'LoanRequest',
        entityId: id,
        action: 'RETURN_SUBMITTED',
        details: JSON.stringify({
          returnDocNumber: docNumber,
          assetCount: dto.items.length,
        }),
        userId: returnerId,
        userName: returnerName,
      },
    });

    return this.findOne(id);
  }
}
