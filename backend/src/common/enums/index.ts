/**
 * Shared Enums - Re-exported from Prisma Client
 *
 * Gunakan file ini untuk import enums di seluruh aplikasi
 * untuk memastikan konsistensi dengan database schema.
 *
 * @example
 * import { AssetStatus, LoanStatus } from '../../common/enums';
 */

// Re-export all enums from Prisma Client
export {
  // User Management
  UserRole,

  // Asset Management
  AssetStatus,
  AssetCondition,
  AssetClassification,
  TrackingMethod,
  BulkType,

  // Request & Procurement
  RequestStatus,
  OrderType,
  AllocationTarget,
  ItemApprovalStatus,

  // Loan & Returns
  LoanStatus,
  AssetReturnStatus,

  // Transactions
  PartyType,
  HandoverStatus,
  InstallationStatus,
  DismantleStatus,
  MaintenanceType,
  MaintenanceStatus,

  // Stock & Audit
  MovementType,

  // Customers
  CustomerStatus,

  // Notifications
  NotificationType,
} from '@prisma/client';

// Type aliases for commonly used enum types
export type { Prisma } from '@prisma/client';
