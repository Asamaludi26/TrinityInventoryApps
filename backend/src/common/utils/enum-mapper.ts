/**
 * Enum Mappers - Transform between backend (Prisma) and frontend (Indonesian labels)
 *
 * Backend menggunakan English enum values (SUPER_ADMIN, IN_STORAGE)
 * Frontend menggunakan Indonesian labels (Super Admin, Di Gudang)
 *
 * IMPORTANT: This file maps Prisma enum values to Indonesian labels.
 * When schema changes, update the mappings here.
 *
 * @example
 * import { mapAssetStatusToLabel, mapLabelToAssetStatus } from './enum-mapper';
 *
 * const label = mapAssetStatusToLabel('IN_STORAGE'); // 'Di Gudang'
 * const status = mapLabelToAssetStatus('Di Gudang'); // 'IN_STORAGE'
 */

import {
  UserRole,
  AssetStatus,
  AssetCondition,
  ItemStatus, // Used for Request, Handover, Installation, Maintenance, Dismantle
  LoanRequestStatus,
  AssetReturnStatus,
} from '@prisma/client';

// ============================================================================
// USER ROLE MAPPINGS
// Note: Schema has SUPER_ADMIN, ADMIN_LOGISTIK, ADMIN_PURCHASE, LEADER, STAFF
// TEKNISI is NOT in the current schema - use STAFF for technicians
// ============================================================================

const userRoleLabelMap: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.ADMIN_LOGISTIK]: 'Admin Logistik',
  [UserRole.ADMIN_PURCHASE]: 'Admin Purchase',
  [UserRole.LEADER]: 'Leader',
  [UserRole.STAFF]: 'Staff',
};

export function mapUserRoleToLabel(role: UserRole): string {
  return userRoleLabelMap[role] || role;
}

export function mapLabelToUserRole(label: string): UserRole | null {
  const entry = Object.entries(userRoleLabelMap).find(([_, v]) => v === label);
  return entry ? (entry[0] as UserRole) : null;
}

// ============================================================================
// ASSET STATUS MAPPINGS
// Schema values: IN_STORAGE, IN_USE, IN_CUSTODY, UNDER_REPAIR, OUT_FOR_REPAIR,
//                DAMAGED, DECOMMISSIONED, AWAITING_RETURN, CONSUMED
// ============================================================================

const assetStatusLabelMap: Record<AssetStatus, string> = {
  [AssetStatus.IN_STORAGE]: 'Di Gudang',
  [AssetStatus.IN_USE]: 'Digunakan',
  [AssetStatus.IN_CUSTODY]: 'Dipegang (Custody)',
  [AssetStatus.UNDER_REPAIR]: 'Dalam Perbaikan',
  [AssetStatus.OUT_FOR_REPAIR]: 'Keluar (Service)',
  [AssetStatus.DAMAGED]: 'Rusak',
  [AssetStatus.DECOMMISSIONED]: 'Diberhentikan',
  [AssetStatus.AWAITING_RETURN]: 'Menunggu Pengembalian',
  [AssetStatus.CONSUMED]: 'Habis Terpakai',
};

export function mapAssetStatusToLabel(status: AssetStatus): string {
  return assetStatusLabelMap[status] || status;
}

export function mapLabelToAssetStatus(label: string): AssetStatus | null {
  const entry = Object.entries(assetStatusLabelMap).find(([_, v]) => v === label);
  return entry ? (entry[0] as AssetStatus) : null;
}

// ============================================================================
// ASSET CONDITION MAPPINGS
// Schema values: BRAND_NEW, GOOD, USED_OKAY, MINOR_DAMAGE, MAJOR_DAMAGE, FOR_PARTS
// ============================================================================

const assetConditionLabelMap: Record<AssetCondition, string> = {
  [AssetCondition.BRAND_NEW]: 'Baru',
  [AssetCondition.GOOD]: 'Baik',
  [AssetCondition.USED_OKAY]: 'Bekas Layak Pakai',
  [AssetCondition.MINOR_DAMAGE]: 'Rusak Ringan',
  [AssetCondition.MAJOR_DAMAGE]: 'Rusak Berat',
  [AssetCondition.FOR_PARTS]: 'Kanibal',
};

export function mapAssetConditionToLabel(condition: AssetCondition): string {
  return assetConditionLabelMap[condition] || condition;
}

export function mapLabelToAssetCondition(label: string): AssetCondition | null {
  const entry = Object.entries(assetConditionLabelMap).find(([_, v]) => v === label);
  return entry ? (entry[0] as AssetCondition) : null;
}

// ============================================================================
// ITEM STATUS MAPPINGS (Used by Request, Handover, Installation, Maintenance, Dismantle)
// Schema values: PENDING, LOGISTIC_APPROVED, AWAITING_CEO_APPROVAL, APPROVED,
//                PURCHASING, IN_DELIVERY, ARRIVED, COMPLETED, REJECTED, CANCELLED,
//                AWAITING_HANDOVER, IN_PROGRESS
// ============================================================================

const itemStatusLabelMap: Record<ItemStatus, string> = {
  [ItemStatus.PENDING]: 'Menunggu',
  [ItemStatus.LOGISTIC_APPROVED]: 'Disetujui Logistik',
  [ItemStatus.AWAITING_CEO_APPROVAL]: 'Menunggu CEO',
  [ItemStatus.APPROVED]: 'Disetujui',
  [ItemStatus.PURCHASING]: 'Proses Pembelian',
  [ItemStatus.IN_DELIVERY]: 'Dalam Pengiriman',
  [ItemStatus.ARRIVED]: 'Tiba',
  [ItemStatus.COMPLETED]: 'Selesai',
  [ItemStatus.REJECTED]: 'Ditolak',
  [ItemStatus.CANCELLED]: 'Dibatalkan',
  [ItemStatus.AWAITING_HANDOVER]: 'Siap Serah Terima',
  [ItemStatus.IN_PROGRESS]: 'Dalam Proses',
};

export function mapItemStatusToLabel(status: ItemStatus): string {
  return itemStatusLabelMap[status] || status;
}

export function mapLabelToItemStatus(label: string): ItemStatus | null {
  const entry = Object.entries(itemStatusLabelMap).find(([_, v]) => v === label);
  return entry ? (entry[0] as ItemStatus) : null;
}

// Backward compatibility aliases
export const mapRequestStatusToLabel = mapItemStatusToLabel;
export const mapLabelToRequestStatus = mapLabelToItemStatus;

// ============================================================================
// LOAN REQUEST STATUS MAPPINGS
// Schema values: PENDING, APPROVED, ON_LOAN, RETURNED, REJECTED, OVERDUE, AWAITING_RETURN
// ============================================================================

const loanRequestStatusLabelMap: Record<LoanRequestStatus, string> = {
  [LoanRequestStatus.PENDING]: 'Menunggu Persetujuan',
  [LoanRequestStatus.APPROVED]: 'Disetujui',
  [LoanRequestStatus.ON_LOAN]: 'Dipinjam',
  [LoanRequestStatus.RETURNED]: 'Dikembalikan',
  [LoanRequestStatus.REJECTED]: 'Ditolak',
  [LoanRequestStatus.OVERDUE]: 'Terlambat',
  [LoanRequestStatus.AWAITING_RETURN]: 'Menunggu Pengembalian',
};

export function mapLoanRequestStatusToLabel(status: LoanRequestStatus): string {
  return loanRequestStatusLabelMap[status] || status;
}

export function mapLabelToLoanRequestStatus(label: string): LoanRequestStatus | null {
  const entry = Object.entries(loanRequestStatusLabelMap).find(([_, v]) => v === label);
  return entry ? (entry[0] as LoanRequestStatus) : null;
}

// Backward compatibility aliases
export const mapLoanStatusToLabel = mapLoanRequestStatusToLabel;
export const mapLabelToLoanStatus = mapLabelToLoanRequestStatus;

// ============================================================================
// ASSET RETURN STATUS MAPPINGS
// Schema values: PENDING_APPROVAL, APPROVED, COMPLETED, REJECTED
// ============================================================================

const assetReturnStatusLabelMap: Record<AssetReturnStatus, string> = {
  [AssetReturnStatus.PENDING_APPROVAL]: 'Menunggu Verifikasi',
  [AssetReturnStatus.APPROVED]: 'Disetujui Sebagian',
  [AssetReturnStatus.COMPLETED]: 'Selesai Diverifikasi',
  [AssetReturnStatus.REJECTED]: 'Ditolak',
};

export function mapAssetReturnStatusToLabel(status: AssetReturnStatus): string {
  return assetReturnStatusLabelMap[status] || status;
}

export function mapLabelToAssetReturnStatus(label: string): AssetReturnStatus | null {
  const entry = Object.entries(assetReturnStatusLabelMap).find(([_, v]) => v === label);
  return entry ? (entry[0] as AssetReturnStatus) : null;
}

// ============================================================================
// GENERIC MAPPER HELPER
// ============================================================================

/**
 * Transform response data with enum mappings
 * Useful for API response transformation
 */
export function transformEnumsToLabels<T extends Record<string, unknown>>(
  data: T,
  mappings: {
    field: keyof T;
    mapper: (value: unknown) => string;
  }[],
): T {
  const result = { ...data };
  for (const { field, mapper } of mappings) {
    if (result[field] !== undefined && result[field] !== null) {
      (result as Record<string, unknown>)[`${String(field)}Label`] = mapper(result[field]);
    }
  }
  return result;
}
