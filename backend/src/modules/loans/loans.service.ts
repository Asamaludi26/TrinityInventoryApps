import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { ApproveLoanDto } from './dto/approve-loan.dto';
import { LoanStatus, AssetStatus } from '@prisma/client';

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

    await this.prisma.$transaction(async tx => {
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
    });

    return this.findOne(id);
  }

  async reject(id: string, reason: string, rejectedBy: string) {
    await this.findOne(id);

    return this.prisma.loanRequest.update({
      where: { id },
      data: {
        status: LoanStatus.REJECTED,
        rejectedBy,
        rejectionReason: reason,
        rejectionDate: new Date(),
      },
    });
  }
}
