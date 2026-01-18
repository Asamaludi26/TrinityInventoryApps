/**
 * =============================================================================
 * Query Types for Type-Safe Database Operations
 * =============================================================================
 *
 * These types provide type safety for Prisma queries and eliminate the need
 * for `any` type usage in services.
 *
 * @module common/types/query.types
 * @version 1.0.0
 * @created 2026-01-19
 */

import { Prisma } from '@prisma/client';

// =============================================================================
// Pagination Types (extends from dto/pagination.dto.ts)
// =============================================================================

/**
 * Prisma-style pagination parameters (skip/take)
 * Use this for internal service methods
 */
export interface PrismaPaginationParams {
  skip?: number;
  take?: number;
}

// Note: PaginatedResult and createPaginatedResult are exported from dto/pagination.dto.ts
// Use those for API responses. The types below are for internal Prisma query building.

// =============================================================================
// Date Range Filter
// =============================================================================

/**
 * Date range filter for queries
 */
export interface DateRangeFilter {
  gte?: Date;
  lte?: Date;
}

/**
 * Build date range filter from string dates
 */
export function buildDateRangeFilter(
  dateFrom?: string,
  dateTo?: string,
): DateRangeFilter | undefined {
  if (!dateFrom && !dateTo) return undefined;

  const filter: DateRangeFilter = {};
  if (dateFrom) filter.gte = new Date(dateFrom);
  if (dateTo) filter.lte = new Date(dateTo);

  return filter;
}

// =============================================================================
// Search Filter Builder
// =============================================================================

/**
 * Build case-insensitive contains filter
 */
export function containsFilter(value: string): Prisma.StringFilter {
  return { contains: value, mode: 'insensitive' };
}

/**
 * Build OR search filter for multiple fields
 */
export function buildSearchFilter(
  search: string,
  fields: string[],
): Prisma.Enumerable<Record<string, Prisma.StringFilter>> {
  return fields.map(field => ({
    [field]: containsFilter(search),
  }));
}

// =============================================================================
// Type-Safe Where Clause Builders
// =============================================================================

/**
 * Asset query parameters
 */
export interface AssetQueryParams extends PrismaPaginationParams {
  status?: string;
  name?: string;
  brand?: string;
  location?: string;
  customerId?: string;
  search?: string;
}

/**
 * Build type-safe Asset where clause
 */
export function buildAssetWhereClause(params: AssetQueryParams): Prisma.AssetWhereInput {
  const { status, name, brand, location, customerId, search } = params;

  const where: Prisma.AssetWhereInput = {
    deletedAt: null,
  };

  if (status) where.status = status as Prisma.EnumAssetStatusFilter;
  if (name) where.name = containsFilter(name);
  if (brand) where.brand = containsFilter(brand);
  if (location) where.location = containsFilter(location);
  if (customerId) where.customerId = customerId;

  if (search) {
    where.OR = [
      { name: containsFilter(search) },
      { brand: containsFilter(search) },
      { serialNumber: containsFilter(search) },
      { id: containsFilter(search) },
    ];
  }

  return where;
}

/**
 * Request query parameters
 */
export interface RequestQueryParams extends PrismaPaginationParams {
  status?: string;
  requesterId?: number;
  division?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Build type-safe Request where clause
 */
export function buildRequestWhereClause(params: RequestQueryParams): Prisma.RequestWhereInput {
  const { status, requesterId, division, dateFrom, dateTo } = params;

  const where: Prisma.RequestWhereInput = {};

  if (status) where.status = status as Prisma.EnumRequestStatusFilter;
  if (requesterId) where.requesterId = requesterId;
  if (division) where.division = containsFilter(division);

  const dateRange = buildDateRangeFilter(dateFrom, dateTo);
  if (dateRange) where.requestDate = dateRange;

  return where;
}

/**
 * User query parameters
 */
export interface UserQueryParams extends PrismaPaginationParams {
  role?: string;
  divisionId?: number;
  search?: string;
}

/**
 * Build type-safe User where clause
 */
export function buildUserWhereClause(params: UserQueryParams): Prisma.UserWhereInput {
  const { role, divisionId, search } = params;

  const where: Prisma.UserWhereInput = {
    deletedAt: null,
  };

  if (role) where.role = role as Prisma.EnumUserRoleFilter;
  if (divisionId) where.divisionId = divisionId;

  if (search) {
    where.OR = [{ name: containsFilter(search) }, { email: containsFilter(search) }];
  }

  return where;
}

/**
 * Loan query parameters
 */
export interface LoanQueryParams extends PrismaPaginationParams {
  status?: string;
  requesterId?: number;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Build type-safe LoanRequest where clause
 */
export function buildLoanWhereClause(params: LoanQueryParams): Prisma.LoanRequestWhereInput {
  const { status, requesterId, dateFrom, dateTo } = params;

  const where: Prisma.LoanRequestWhereInput = {};

  if (status) where.status = status as Prisma.EnumLoanStatusFilter;
  if (requesterId) where.requesterId = requesterId;

  const dateRange = buildDateRangeFilter(dateFrom, dateTo);
  if (dateRange) where.requestDate = dateRange;

  return where;
}

/**
 * Customer query parameters
 */
export interface CustomerQueryParams extends PrismaPaginationParams {
  search?: string;
  status?: string;
}

/**
 * Build type-safe Customer where clause
 */
export function buildCustomerWhereClause(params: CustomerQueryParams): Prisma.CustomerWhereInput {
  const { search, status } = params;

  const where: Prisma.CustomerWhereInput = {
    deletedAt: null,
  };

  if (status) where.status = status as Prisma.EnumCustomerStatusFilter;

  if (search) {
    where.OR = [
      { name: containsFilter(search) },
      { id: containsFilter(search) },
      { address: containsFilter(search) },
    ];
  }

  return where;
}

/**
 * Activity Log query parameters
 */
export interface ActivityLogQueryParams extends PrismaPaginationParams {
  performedBy?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Build type-safe ActivityLog where clause
 */
export function buildActivityLogWhereClause(
  params: ActivityLogQueryParams,
): Prisma.ActivityLogWhereInput {
  const { performedBy, action, entityType, entityId, dateFrom, dateTo } = params;

  const where: Prisma.ActivityLogWhereInput = {};

  if (performedBy) where.performedBy = containsFilter(performedBy);
  if (action) where.action = containsFilter(action);
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;

  const dateRange = buildDateRangeFilter(dateFrom, dateTo);
  if (dateRange) where.createdAt = dateRange;

  return where;
}
