import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { ApproveLoanDto } from './dto/approve-loan.dto';
import { LoanStatus, AssetStatus, Prisma } from '@prisma/client';

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  private async generateDocNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `RL-${year}-${month}-`;

    const lastLoan = await this.prisma.loanRequest.findFirst({
      where: { docNumber: { startsWith: prefix } },
      orderBy: { docNumber: 'desc' },
    });

    let sequence = 1;
    if (lastLoan) {
      const lastSeq = parseInt(lastLoan.docNumber.split('-').pop() || '0');
      sequence = lastSeq + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  async create(dto: CreateLoanDto, requesterId: number) {
    const docNumber = await this.generateDocNumber();

    return this.prisma.loanRequest.create({
      data: {
        id: docNumber,
        docNumber,
        requesterId,
        status: LoanStatus.PENDING,
        requestDate: new Date(dto.requestDate),
        purpose: dto.purpose,
        expectedReturn: dto.expectedReturn ? new Date(dto.expectedReturn) : null,
        items: dto.items.map(item => ({ ...item })),
      },
      include: {
        requester: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    status?: LoanStatus;
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
        assetReturns: true,
      },
    });

    if (!loan) {
      throw new NotFoundException(`Loan request ${id} tidak ditemukan`);
    }

    return loan;
  }

  async approve(id: string, dto: ApproveLoanDto, approverName: string) {
    const loan = await this.findOne(id);

    if (loan.status !== LoanStatus.PENDING) {
      throw new BadRequestException('Loan request tidak dalam status PENDING');
    }

    // Validate and update asset statuses
    const allAssetIds = Object.values(dto.assignedAssetIds).flat();

    if (allAssetIds.length === 0) {
      throw new BadRequestException('Minimal satu asset harus di-assign');
    }

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Validate all assets exist, are available, and not deleted
      const assets = await tx.asset.findMany({
        where: {
          id: { in: allAssetIds },
          deletedAt: null,
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

      // Update asset statuses to ON_LOAN
      await tx.asset.updateMany({
        where: { id: { in: allAssetIds } },
        data: { status: AssetStatus.ON_LOAN },
      });

      // Update loan request
      await tx.loanRequest.update({
        where: { id },
        data: {
          status: LoanStatus.ON_LOAN,
          assignedAssets: dto.assignedAssetIds,
          approver: approverName,
          approvalDate: new Date(),
        },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          entityType: 'LoanRequest',
          entityId: id,
          action: 'APPROVED',
          changes: {
            status: { old: LoanStatus.PENDING, new: LoanStatus.ON_LOAN },
            assignedAssets: allAssetIds,
          },
          performedBy: approverName,
        },
      });
    });

    return this.findOne(id);
  }

  async reject(id: string, reason: string, rejectedBy: string) {
    const loan = await this.findOne(id);

    // Validate status - can only reject PENDING loans
    if (loan.status !== LoanStatus.PENDING) {
      throw new BadRequestException(
        `Loan request tidak dapat di-reject karena status sudah ${loan.status}`,
      );
    }

    const updated = await this.prisma.loanRequest.update({
      where: { id },
      data: {
        status: LoanStatus.REJECTED,
        rejectedBy,
        rejectionReason: reason,
        rejectionDate: new Date(),
      },
    });

    // Log activity
    await this.prisma.activityLog.create({
      data: {
        entityType: 'LoanRequest',
        entityId: id,
        action: 'REJECTED',
        changes: {
          status: { old: LoanStatus.PENDING, new: LoanStatus.REJECTED },
          reason,
        },
        performedBy: rejectedBy,
      },
    });

    return updated;
  }
}
