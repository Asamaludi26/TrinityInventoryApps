/**
 * =============================================================================
 * Document Number Service Unit Tests
 * =============================================================================
 *
 * Tests for centralized document number generation.
 *
 * @module test/unit/common/document-number.service.spec
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  DocumentNumberService,
  DocumentType,
} from '../../../src/common/services/document-number.service';
import { PrismaService } from '../../../src/common/prisma/prisma.service';

describe('DocumentNumberService', () => {
  let service: DocumentNumberService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    $queryRawUnsafe: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentNumberService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DocumentNumberService>(DocumentNumberService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generate', () => {
    const testDate = new Date('2026-01-19T10:00:00Z');

    describe('ASSET document type (YEAR format)', () => {
      it('should generate first asset ID when no previous exists', async () => {
        mockPrismaService.$queryRawUnsafe.mockResolvedValue([]);

        const result = await service.generate(DocumentType.ASSET, testDate);

        expect(result).toBe('AST-2026-0001');
        expect(mockPrismaService.$queryRawUnsafe).toHaveBeenCalledWith(
          expect.stringContaining('AST-2026-%'),
        );
      });

      it('should increment sequence when previous exists', async () => {
        mockPrismaService.$queryRawUnsafe.mockResolvedValue([{ id: 'AST-2026-0015' }]);

        const result = await service.generate(DocumentType.ASSET, testDate);

        expect(result).toBe('AST-2026-0016');
      });

      it('should handle large sequence numbers', async () => {
        mockPrismaService.$queryRawUnsafe.mockResolvedValue([{ id: 'AST-2026-9999' }]);

        const result = await service.generate(DocumentType.ASSET, testDate);

        expect(result).toBe('AST-2026-10000');
      });
    });

    describe('REQUEST document type (YEAR_MONTH_DAY format)', () => {
      it('should generate first request number when no previous exists', async () => {
        mockPrismaService.$queryRawUnsafe.mockResolvedValue([]);

        const result = await service.generate(DocumentType.REQUEST, testDate);

        expect(result).toBe('RO-2026-0119-0001');
      });

      it('should increment sequence when previous exists', async () => {
        mockPrismaService.$queryRawUnsafe.mockResolvedValue([{ id: 'RO-2026-0119-0005' }]);

        const result = await service.generate(DocumentType.REQUEST, testDate);

        expect(result).toBe('RO-2026-0119-0006');
      });

      it('should reset sequence for new day', async () => {
        // Previous day had requests
        mockPrismaService.$queryRawUnsafe.mockResolvedValue([]);

        const newDate = new Date('2026-01-20T10:00:00Z');
        const result = await service.generate(DocumentType.REQUEST, newDate);

        expect(result).toBe('RO-2026-0120-0001');
      });
    });

    describe('LOAN document type (YEAR_MONTH format)', () => {
      it('should generate first loan number when no previous exists', async () => {
        mockPrismaService.$queryRawUnsafe.mockResolvedValue([]);

        const result = await service.generate(DocumentType.LOAN, testDate);

        expect(result).toBe('RL-2026-01-0001');
      });

      it('should increment sequence within same month', async () => {
        mockPrismaService.$queryRawUnsafe.mockResolvedValue([{ id: 'RL-2026-01-0003' }]);

        const result = await service.generate(DocumentType.LOAN, testDate);

        expect(result).toBe('RL-2026-01-0004');
      });
    });

    describe('RETURN document type', () => {
      it('should generate return number with RTN prefix', async () => {
        mockPrismaService.$queryRawUnsafe.mockResolvedValue([]);

        const result = await service.generate(DocumentType.RETURN, testDate);

        expect(result).toBe('RTN-2026-01-0001');
      });
    });

    describe('HANDOVER document type', () => {
      it('should generate handover number with HO prefix', async () => {
        mockPrismaService.$queryRawUnsafe.mockResolvedValue([]);

        const result = await service.generate(DocumentType.HANDOVER, testDate);

        expect(result).toBe('HO-2026-01-0001');
      });
    });

    describe('INSTALLATION document type', () => {
      it('should generate installation number with INST prefix', async () => {
        mockPrismaService.$queryRawUnsafe.mockResolvedValue([]);

        const result = await service.generate(DocumentType.INSTALLATION, testDate);

        expect(result).toBe('INST-2026-01-0001');
      });
    });

    describe('DISMANTLE document type', () => {
      it('should generate dismantle number with DSM prefix', async () => {
        mockPrismaService.$queryRawUnsafe.mockResolvedValue([]);

        const result = await service.generate(DocumentType.DISMANTLE, testDate);

        expect(result).toBe('DSM-2026-01-0001');
      });
    });

    describe('MAINTENANCE document type', () => {
      it('should generate maintenance number with MNT prefix', async () => {
        mockPrismaService.$queryRawUnsafe.mockResolvedValue([]);

        const result = await service.generate(DocumentType.MAINTENANCE, testDate);

        expect(result).toBe('MNT-2026-01-0001');
      });
    });
  });

  describe('validateFormat', () => {
    describe('ASSET format validation', () => {
      it('should validate correct ASSET format', () => {
        expect(service.validateFormat('AST-2026-0001', DocumentType.ASSET)).toBe(true);
        expect(service.validateFormat('AST-2025-9999', DocumentType.ASSET)).toBe(true);
      });

      it('should reject invalid ASSET format', () => {
        expect(service.validateFormat('AST-26-0001', DocumentType.ASSET)).toBe(false);
        expect(service.validateFormat('AST-2026-001', DocumentType.ASSET)).toBe(false);
        expect(service.validateFormat('ASSET-2026-0001', DocumentType.ASSET)).toBe(false);
      });
    });

    describe('REQUEST format validation', () => {
      it('should validate correct REQUEST format', () => {
        expect(service.validateFormat('RO-2026-0119-0001', DocumentType.REQUEST)).toBe(true);
        expect(service.validateFormat('RO-2025-1231-9999', DocumentType.REQUEST)).toBe(true);
      });

      it('should reject invalid REQUEST format', () => {
        expect(service.validateFormat('RO-2026-01-0001', DocumentType.REQUEST)).toBe(false);
        expect(service.validateFormat('RO-2026-119-0001', DocumentType.REQUEST)).toBe(false);
      });
    });

    describe('LOAN format validation', () => {
      it('should validate correct LOAN format', () => {
        expect(service.validateFormat('RL-2026-01-0001', DocumentType.LOAN)).toBe(true);
        expect(service.validateFormat('RL-2025-12-9999', DocumentType.LOAN)).toBe(true);
      });

      it('should reject invalid LOAN format', () => {
        expect(service.validateFormat('RL-2026-1-0001', DocumentType.LOAN)).toBe(false);
        expect(service.validateFormat('RL-2026-001-0001', DocumentType.LOAN)).toBe(false);
      });
    });
  });

  describe('parseDocNumber', () => {
    it('should parse ASSET document number', () => {
      const result = service.parseDocNumber('AST-2026-0015');

      expect(result).toEqual({
        prefix: 'AST',
        year: 2026,
        month: undefined,
        day: undefined,
        sequence: 15,
      });
    });

    it('should parse LOAN document number with month', () => {
      const result = service.parseDocNumber('RL-2026-03-0042');

      expect(result).toEqual({
        prefix: 'RL',
        year: 2026,
        month: 3,
        day: undefined,
        sequence: 42,
      });
    });

    it('should parse REQUEST document number with month and day', () => {
      const result = service.parseDocNumber('RO-2026-0315-0007');

      expect(result).toEqual({
        prefix: 'RO',
        year: 2026,
        month: 3,
        day: 15,
        sequence: 7,
      });
    });

    it('should return null for invalid format', () => {
      expect(service.parseDocNumber('INVALID')).toBeNull();
      expect(service.parseDocNumber('AB-12')).toBeNull();
    });
  });

  describe('generateInTransaction', () => {
    it('should generate number using transaction client', async () => {
      const mockTx = {
        $queryRawUnsafe: jest.fn().mockResolvedValue([{ id: 'AST-2026-0005' }]),
      } as unknown as PrismaService;
      const testDate = new Date('2026-01-19T10:00:00Z');

      const result = await service.generateInTransaction(DocumentType.ASSET, mockTx, testDate);

      expect(result).toBe('AST-2026-0006');
      expect(mockTx.$queryRawUnsafe).toHaveBeenCalled();
    });
  });
});
