import { Test, TestingModule } from '@nestjs/testing';
import { LoansService } from '../../src/modules/loans/loans.service';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AssetStatus } from '@prisma/client';

describe('LoansService', () => {
  let service: LoansService;
  let prisma: jest.Mocked<PrismaService>;

  const mockLoan = {
    id: 'RL-2025-01-0001',
    docNumber: 'RL-2025-01-0001',
    requesterId: 1,
    status: 'PENDING' as any,
    requestDate: new Date(),
    purpose: 'Testing',
    expectedReturn: new Date(),
    items: [{ itemName: 'Router', brand: 'Mikrotik', quantity: 2 }],
    assignedAssets: null,
    returnedAssets: [],
    requester: { id: 1, name: 'Test User', email: 'test@example.com' },
    assetReturns: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAsset = {
    id: 'AST-2025-0001',
    name: 'Router',
    brand: 'Mikrotik',
    status: AssetStatus.IN_STORAGE,
    deletedAt: null,
  };

  const mockTransaction = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoansService,
        {
          provide: PrismaService,
          useValue: {
            // PERBAIKAN 1: Tambahkan mock untuk 'user'
            user: {
              findUnique: jest.fn(),
            },
            loanRequest: {
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            asset: {
              findMany: jest.fn(),
              updateMany: jest.fn(),
            },
            activityLog: {
              create: jest.fn(),
            },
            // Tambahkan loanAssetAssignment di level root prisma juga untuk safety
            loanAssetAssignment: {
              create: jest.fn(),
            },
            $transaction: mockTransaction,
          },
        },
      ],
    }).compile();

    service = module.get<LoansService>(LoansService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a loan request', async () => {
      (prisma.loanRequest.findFirst as jest.Mock).mockResolvedValue(null);
      // PERBAIKAN: Mock return value untuk user check
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockLoan.requester);
      (prisma.loanRequest.create as jest.Mock).mockResolvedValue(mockLoan);

      const dto = {
        requestDate: new Date().toISOString(),
        purpose: 'Testing',
        items: [{ id: 1, itemName: 'Router', brand: 'Mikrotik', quantity: 2 }],
      };

      const result = await service.create(dto, 1);

      expect(result).toEqual(mockLoan);
      expect(prisma.loanRequest.create).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a loan if found', async () => {
      (prisma.loanRequest.findUnique as jest.Mock).mockResolvedValue(mockLoan);

      const result = await service.findOne('RL-2025-01-0001');

      expect(result).toEqual(mockLoan);
    });

    it('should throw NotFoundException if loan not found', async () => {
      (prisma.loanRequest.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('INVALID')).rejects.toThrow(NotFoundException);
    });
  });

  describe('approve', () => {
    it('should approve a pending loan with valid assets', async () => {
      const pendingLoan = { ...mockLoan, status: 'PENDING' as any };
      const approvedLoan = { ...mockLoan, status: 'ON_LOAN' as any };

      // Setup mock transaction
      mockTransaction.mockImplementation(async callback => {
        const tx = {
          asset: {
            findMany: jest.fn().mockResolvedValue([mockAsset]),
            updateMany: jest.fn(),
          },
          loanRequest: {
            update: jest.fn().mockResolvedValue(approvedLoan),
          },
          activityLog: {
            create: jest.fn(),
          },
          // PERBAIKAN 2: Tambahkan mock loanAssetAssignment ke dalam object transaction (tx)
          loanAssetAssignment: {
            create: jest.fn(),
          },
        };
        return callback(tx);
      });

      (prisma.loanRequest.findUnique as jest.Mock)
        .mockResolvedValueOnce(pendingLoan)
        .mockResolvedValueOnce(approvedLoan);

      const dto = {
        assignedAssetIds: { '1': ['AST-2025-0001'] },
      };

      const result = await service.approve('RL-2025-01-0001', dto, 1, 'Admin');

      expect(result.status).toBe('ON_LOAN');
    });

    it('should throw BadRequestException if loan is not PENDING', async () => {
      const onLoanLoan = { ...mockLoan, status: 'ON_LOAN' as any };
      (prisma.loanRequest.findUnique as jest.Mock).mockResolvedValue(onLoanLoan);

      await expect(
        service.approve('RL-2025-01-0001', { assignedAssetIds: {} }, 1, 'Admin'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if no assets assigned', async () => {
      const pendingLoan = { ...mockLoan, status: 'PENDING' as any };
      (prisma.loanRequest.findUnique as jest.Mock).mockResolvedValue(pendingLoan);

      await expect(
        service.approve('RL-2025-01-0001', { assignedAssetIds: {} }, 1, 'Admin'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if asset not found', async () => {
      const pendingLoan = { ...mockLoan, status: 'PENDING' as any };

      mockTransaction.mockImplementation(async callback => {
        const tx = {
          asset: {
            findMany: jest.fn().mockResolvedValue([]), // No assets found
          },
        };
        return callback(tx);
      });

      (prisma.loanRequest.findUnique as jest.Mock).mockResolvedValue(pendingLoan);

      await expect(
        service.approve('RL-2025-01-0001', { assignedAssetIds: { '1': ['INVALID'] } }, 1, 'Admin'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if asset not available', async () => {
      const pendingLoan = { ...mockLoan, status: 'PENDING' as any };
      const onLoanAsset = { ...mockAsset, status: AssetStatus.IN_USE };

      mockTransaction.mockImplementation(async callback => {
        const tx = {
          asset: {
            findMany: jest.fn().mockResolvedValue([onLoanAsset]),
          },
        };
        return callback(tx);
      });

      (prisma.loanRequest.findUnique as jest.Mock).mockResolvedValue(pendingLoan);

      await expect(
        service.approve(
          'RL-2025-01-0001',
          { assignedAssetIds: { '1': ['AST-2025-0001'] } },
          1,
          'Admin',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('reject', () => {
    it('should reject a pending loan', async () => {
      const pendingLoan = { ...mockLoan, status: 'PENDING' as any };
      const rejectedLoan = { ...mockLoan, status: 'REJECTED' as any };

      (prisma.loanRequest.findUnique as jest.Mock).mockResolvedValue(pendingLoan);
      (prisma.loanRequest.update as jest.Mock).mockResolvedValue(rejectedLoan);
      (prisma.activityLog.create as jest.Mock).mockResolvedValue({});

      const result = await service.reject('RL-2025-01-0001', 'Not approved', 1, 'Admin');

      expect(result.status).toBe('REJECTED');
    });

    it('should throw BadRequestException if loan is not PENDING', async () => {
      const onLoanLoan = { ...mockLoan, status: 'ON_LOAN' as any };
      (prisma.loanRequest.findUnique as jest.Mock).mockResolvedValue(onLoanLoan);

      await expect(service.reject('RL-2025-01-0001', 'Reason', 1, 'Admin')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
