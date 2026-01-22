/**
 * Shared Enums - Re-exported from Prisma Client
 *
 * Gunakan file ini untuk import enums di seluruh aplikasi
 * untuk memastikan konsistensi dengan database schema.
 *
 * IMPORTANT: Enums are defined in prisma/schema.prisma
 * Always check schema.prisma for available enum values
 *
 * @example
 * import { AssetStatus, LoanRequestStatus } from '../../common/enums';
 */

// Re-export all enums from Prisma Client
export {
  // User Management
  UserRole,

  // Asset Management
  AssetStatus,
  AssetCondition,
  ItemClassification,
  TrackingMethod,
  BulkTrackingMode,

  // Request & Procurement
  ItemStatus, // Used for Request, Handover, Installation, Maintenance, Dismantle status
  OrderType,
  AllocationTarget,
  ItemApprovalStatus,

  // Loan & Returns
  LoanRequestStatus,
  AssetReturnStatus,
  ReturnItemStatus,

  // Stock & Movement
  MovementType,
  LocationContext,

  // Customers
  CustomerStatus,

  // Attachments
  AttachmentType,
} from '@prisma/client';

// Type aliases for commonly used enum types
export type { Prisma } from '@prisma/client';

// ============================================================================
// BACKWARD COMPATIBILITY ALIASES
// Some code uses old enum names - provide aliases for easier migration
// ============================================================================

// Alias for backward compatibility - LoanStatus is now LoanRequestStatus
export { LoanRequestStatus as LoanStatus } from '@prisma/client';

// Alias for backward compatibility - RequestStatus is now ItemStatus
export { ItemStatus as RequestStatus } from '@prisma/client';

// Alias for backward compatibility - HandoverStatus is ItemStatus (Handover uses ItemStatus)
export { ItemStatus as HandoverStatus } from '@prisma/client';

// Alias for backward compatibility - InstallationStatus is ItemStatus
export { ItemStatus as InstallationStatus } from '@prisma/client';

// Alias for backward compatibility - DismantleStatus is ItemStatus
export { ItemStatus as DismantleStatus } from '@prisma/client';

// Alias for backward compatibility - MaintenanceStatus is ItemStatus
export { ItemStatus as MaintenanceStatus } from '@prisma/client';
