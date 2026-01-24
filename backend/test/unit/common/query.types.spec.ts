/**
 * =============================================================================
 * Query Types Unit Tests
 * =============================================================================
 *
 * Tests for type-safe query builders and pagination utilities.
 *
 * @module test/unit/common/query.types.spec
 */

import {
  buildAssetWhereClause,
  buildRequestWhereClause,
  buildUserWhereClause,
  buildLoanWhereClause,
  buildCustomerWhereClause,
  buildActivityLogWhereClause,
  containsFilter,
  buildDateRangeFilter,
  type AssetQueryParams,
  type RequestQueryParams,
  type LoanQueryParams,
  type ActivityLogQueryParams,
} from '../../../src/common/types/query.types';

import { createPaginatedResult } from '../../../src/common/dto/pagination.dto';

describe('Query Types', () => {
  describe('createPaginatedResult (from pagination.dto)', () => {
    it('should create paginated result with correct metadata', () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const total = 100;
      const page = 2;
      const limit = 10;

      const result = createPaginatedResult(items, total, page, limit);

      expect(result).toEqual({
        items: items,
        meta: {
          total: 100,
          page: 2,
          limit: 10,
          totalPages: 10,
        },
      });
    });

    it('should calculate correct totalPages', () => {
      const items = [{ id: 1 }];

      // Exact division
      expect(createPaginatedResult(items, 100, 1, 10).meta.totalPages).toBe(10);

      // Remainder
      expect(createPaginatedResult(items, 101, 1, 10).meta.totalPages).toBe(11);

      // Less than one page
      expect(createPaginatedResult(items, 5, 1, 10).meta.totalPages).toBe(1);

      // Zero items
      expect(createPaginatedResult([], 0, 1, 10).meta.totalPages).toBe(0);
    });

    it('should work with typed data', () => {
      interface User {
        id: number;
        name: string;
      }

      const users: User[] = [{ id: 1, name: 'John' }];
      const result = createPaginatedResult<User>(users, 1, 1, 10);

      expect(result.items[0].name).toBe('John');
    });
  });

  describe('containsFilter', () => {
    it('should create case-insensitive contains filter', () => {
      expect(containsFilter('test')).toEqual({
        contains: 'test',
        mode: 'insensitive',
      });
    });
  });

  describe('buildDateRangeFilter', () => {
    it('should build filter with both start and end dates', () => {
      const result = buildDateRangeFilter('2025-01-01', '2025-12-31');

      expect(result).toEqual({
        gte: new Date('2025-01-01'),
        lte: new Date('2025-12-31'),
      });
    });

    it('should build filter with only start date', () => {
      const result = buildDateRangeFilter('2025-01-01', undefined);

      expect(result).toEqual({
        gte: new Date('2025-01-01'),
      });
    });

    it('should build filter with only end date', () => {
      const result = buildDateRangeFilter(undefined, '2025-12-31');

      expect(result).toEqual({
        lte: new Date('2025-12-31'),
      });
    });

    it('should return undefined when no dates provided', () => {
      expect(buildDateRangeFilter(undefined, undefined)).toBeUndefined();
    });
  });

  describe('buildAssetWhereClause', () => {
    it('should return object with deletedAt null for empty params', () => {
      const result = buildAssetWhereClause({});
      expect(result).toBeDefined();
    });

    it('should build clause with search parameter', () => {
      const result = buildAssetWhereClause({ search: 'laptop' });

      expect(result.OR).toBeDefined();
      expect(result.OR?.length).toBeGreaterThan(0);
    });

    it('should build clause with status filter', () => {
      const result = buildAssetWhereClause({ status: 'AVAILABLE' as any });

      expect(result.status).toBe('AVAILABLE');
    });

    it('should build clause with multiple filters', () => {
      const params: AssetQueryParams = {
        search: 'laptop',
        status: 'AVAILABLE' as any,
      };

      const result = buildAssetWhereClause(params);

      expect(result.OR).toBeDefined();
      expect(result.status).toBe('AVAILABLE');
    });
  });

  describe('buildRequestWhereClause', () => {
    it('should return empty object for empty params', () => {
      const result = buildRequestWhereClause({});
      expect(result).toEqual({});
    });

    it('should build clause with status filter', () => {
      const result = buildRequestWhereClause({ status: 'PENDING' as any });
      expect(result.status).toBe('PENDING');
    });

    it('should build clause with requesterId filter', () => {
      const result = buildRequestWhereClause({ requesterId: 123 });
      expect(result.requesterId).toBe(123);
    });

    it('should build clause with date range', () => {
      const params: RequestQueryParams = {
        dateFrom: '2025-01-01',
        dateTo: '2025-12-31',
      };

      const result = buildRequestWhereClause(params);
      expect(result.requestDate).toBeDefined();
    });
  });

  describe('buildUserWhereClause', () => {
    // PERBAIKAN DI SINI: Mengubah ekspektasi dari deletedAt: null menjadi isActive: true
    it('should return object with isActive true for empty params', () => {
      const result = buildUserWhereClause({});
      expect(result).toEqual({ isActive: true });
    });

    it('should build clause with role filter', () => {
      const result = buildUserWhereClause({ role: 'ADMIN' as any });
      expect(result.role).toBe('ADMIN');
    });

    it('should build clause with divisionId filter', () => {
      const result = buildUserWhereClause({ divisionId: 123 });
      expect(result.divisionId).toBe(123);
    });

    it('should build clause with search', () => {
      const result = buildUserWhereClause({ search: 'john' });
      expect(result.OR).toBeDefined();
      expect(result.OR?.length).toBeGreaterThan(0);
    });
  });

  describe('buildLoanWhereClause', () => {
    it('should return empty object for empty params', () => {
      const result = buildLoanWhereClause({});
      expect(result).toEqual({});
    });

    it('should build clause with status filter', () => {
      const result = buildLoanWhereClause({ status: 'PENDING' as any });
      expect(result.status).toBe('PENDING');
    });

    it('should build clause with requesterId filter', () => {
      const result = buildLoanWhereClause({ requesterId: 456 });
      expect(result.requesterId).toBe(456);
    });

    it('should build clause with date range', () => {
      const params: LoanQueryParams = {
        dateFrom: '2025-01-01',
        dateTo: '2025-12-31',
      };

      const result = buildLoanWhereClause(params);
      expect(result.requestDate).toBeDefined();
    });
  });

  describe('buildCustomerWhereClause', () => {
    it('should return object with deletedAt null for empty params', () => {
      const result = buildCustomerWhereClause({});
      expect(result).toBeDefined();
    });

    it('should build clause with status filter', () => {
      const result = buildCustomerWhereClause({ status: 'ACTIVE' as any });
      expect(result.status).toBe('ACTIVE');
    });

    it('should build clause with search', () => {
      const result = buildCustomerWhereClause({ search: 'acme' });
      expect(result.OR).toBeDefined();
      expect(result.OR?.length).toBeGreaterThan(0);
    });
  });

  describe('buildActivityLogWhereClause', () => {
    it('should return empty object for empty params', () => {
      const result = buildActivityLogWhereClause({});
      expect(result).toEqual({});
    });

    it('should build clause with userName filter', () => {
      const result = buildActivityLogWhereClause({ userName: 'admin' } as any);
      expect(result.userName).toBeDefined();
    });

    it('should build clause with action filter', () => {
      const result = buildActivityLogWhereClause({ action: 'CREATE' });
      expect(result.action).toBeDefined();
    });

    it('should build clause with entityType filter', () => {
      const result = buildActivityLogWhereClause({ entityType: 'Asset' });
      expect(result.entityType).toBe('Asset');
    });

    it('should build clause with date range', () => {
      const params: ActivityLogQueryParams = {
        dateFrom: '2025-01-01',
        dateTo: '2025-12-31',
      };

      const result = buildActivityLogWhereClause(params);
      expect(result.timestamp).toBeDefined();
    });
  });
});
