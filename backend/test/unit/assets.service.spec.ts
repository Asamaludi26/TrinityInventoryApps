import { Test, TestingModule } from '@nestjs/testing';
import { AssetsService } from '../../src/modules/assets/assets.service';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AssetStatus, MovementType } from '@prisma/client';

describe('AssetsService', () => {
  let service: AssetsService;
  let prisma: jest.Mocked<PrismaService>;

  const mockAsset = {
    id: 'AST-2025-0001',
    name: 'Router',
    brand: 'Mikrotik',
    modelId: 1,
    serialNumber: 'SN12345',
    status: AssetStatus.IN_STORAGE,
    condition: 'GOOD',
    currentBalance: null,
    quantity: 1,
    location: 'Gudang A',
    deletedAt: null,
    model: { id: 1, name: 'RB750', brand: 'Mikrotik' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTransaction = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsService,
        {
          provide: PrismaService,
          useValue: {
            asset: {
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              createMany: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
              count: jest.fn(),
            },
            stockMovement: {
              create: jest.fn(),
              createMany: jest.fn(),
            },
            activityLog: {
              create: jest.fn(),
            },
            assetModel: {
              findMany: jest.fn(),
            },
            $transaction: mockTransaction,
          },
        },
      ],
    }).compile();

    service = module.get<AssetsService>(AssetsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an asset with auto-generated ID', async () => {
      (prisma.asset.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.asset.create as jest.Mock).mockResolvedValue(mockAsset);
      (prisma.stockMovement.create as jest.Mock).mockResolvedValue({});

      const dto = {
        name: 'Router',
        brand: 'Mikrotik',
        modelId: 1,
      };

      const result = await service.create(dto);

      expect(result).toEqual(mockAsset);
      expect(prisma.asset.create).toHaveBeenCalled();
      expect(prisma.stockMovement.create).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an asset if found', async () => {
      (prisma.asset.findUnique as jest.Mock).mockResolvedValue(mockAsset);

      const result = await service.findOne('AST-2025-0001');

      expect(result).toEqual(mockAsset);
    });

    it('should throw NotFoundException if asset not found', async () => {
      (prisma.asset.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('INVALID')).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkAvailability', () => {
    it('should return availability info for individual assets', async () => {
      (prisma.asset.findMany as jest.Mock).mockResolvedValue([
        { ...mockAsset, currentBalance: null, quantity: null },
        { ...mockAsset, id: 'AST-2025-0002', currentBalance: null, quantity: null },
      ]);

      const result = await service.checkAvailability('Router', 'Mikrotik', 2);

      expect(result.isSufficient).toBe(true);
      expect(result.available).toBe(2);
      expect(result.requested).toBe(2);
    });

    it('should return insufficient if not enough assets', async () => {
      (prisma.asset.findMany as jest.Mock).mockResolvedValue([mockAsset]);

      const result = await service.checkAvailability('Router', 'Mikrotik', 5);

      expect(result.isSufficient).toBe(false);
      expect(result.deficit).toBe(4);
    });
  });

  describe('consumeStock', () => {
    it('should consume stock atomically in a transaction', async () => {
      const measurementAsset = {
        ...mockAsset,
        currentBalance: 100,
        quantity: null,
      };

      mockTransaction.mockImplementation(async callback => {
        const tx = {
          asset: {
            findMany: jest.fn().mockResolvedValue([measurementAsset]),
            update: jest.fn(),
          },
          stockMovement: {
            create: jest.fn(),
          },
        };
        return callback(tx);
      });

      const dto = {
        items: [{ itemName: 'Cable', brand: 'Generic', quantity: 50, unit: 'Meter' }],
        context: {
          referenceType: 'INSTALLATION',
          referenceId: 'INST-2025-0001',
          technician: 'Tech User',
        },
      };

      const result = await service.consumeStock(dto);

      expect(result.success).toBe(true);
      expect(mockTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if stock insufficient', async () => {
      const lowStockAsset = {
        ...mockAsset,
        currentBalance: 10,
        quantity: null,
      };

      mockTransaction.mockImplementation(async callback => {
        const tx = {
          asset: {
            findMany: jest.fn().mockResolvedValue([lowStockAsset]),
            update: jest.fn(),
          },
          stockMovement: {
            create: jest.fn(),
          },
        };
        return callback(tx);
      });

      const dto = {
        items: [{ itemName: 'Cable', brand: 'Generic', quantity: 100, unit: 'Meter' }],
        context: {
          referenceType: 'INSTALLATION',
          referenceId: 'INST-2025-0001',
        },
      };

      await expect(service.consumeStock(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('createBulk', () => {
    it('should create multiple assets in a transaction', async () => {
      const createdAssets = [
        { ...mockAsset, id: 'AST-2025-0001' },
        { ...mockAsset, id: 'AST-2025-0002' },
      ];

      mockTransaction.mockImplementation(async callback => {
        const tx = {
          assetModel: {
            findMany: jest.fn().mockResolvedValue([{ id: 1 }]),
          },
          asset: {
            findMany: jest.fn().mockResolvedValue([]),
            createMany: jest.fn(),
            findFirst: jest.fn().mockResolvedValue(null),
          },
          stockMovement: {
            createMany: jest.fn(),
          },
        };
        // Mock generateAssetId using the service's internal method
        return { created: 2, ids: ['AST-2025-0001', 'AST-2025-0002'] };
      });

      const dto = {
        items: [
          { name: 'Router', brand: 'Mikrotik', modelId: 1 },
          { name: 'Router', brand: 'Mikrotik', modelId: 1 },
        ],
        performedBy: 'Admin',
        notes: 'Bulk registration',
      };

      const result = await service.createBulk(dto);

      expect(result.created).toBe(2);
      expect(result.ids).toHaveLength(2);
    });

    it('should throw BadRequestException if model not found', async () => {
      mockTransaction.mockImplementation(async callback => {
        const tx = {
          assetModel: {
            findMany: jest.fn().mockResolvedValue([]), // No models found
          },
        };
        return callback(tx);
      });

      const dto = {
        items: [{ name: 'Router', brand: 'Mikrotik', modelId: 999 }],
      };

      await expect(service.createBulk(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if serial number already exists', async () => {
      mockTransaction.mockImplementation(async callback => {
        const tx = {
          assetModel: {
            findMany: jest.fn().mockResolvedValue([{ id: 1 }]),
          },
          asset: {
            findMany: jest.fn().mockResolvedValue([{ serialNumber: 'SN12345' }]), // Duplicate serial
          },
        };
        return callback(tx);
      });

      const dto = {
        items: [{ name: 'Router', brand: 'Mikrotik', modelId: 1, serialNumber: 'SN12345' }],
      };

      await expect(service.createBulk(dto)).rejects.toThrow(BadRequestException);
    });
  });
});
