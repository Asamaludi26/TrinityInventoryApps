/**
 * Enum Mappers - Transform between backend (Prisma) and frontend (Indonesian labels)
 *
 * Backend menggunakan English enum values (SUPER_ADMIN, IN_STORAGE)
 * Frontend menggunakan Indonesian labels (Super Admin, Di Gudang)
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
  RequestStatus,
  LoanStatus,
  AssetReturnStatus,
} from '@prisma/client';

// ============================================================================
// USER ROLE MAPPINGS
// ============================================================================

const userRoleLabelMap: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.ADMIN_LOGISTIK]: 'Admin Logistik',
  [UserRole.ADMIN_PURCHASE]: 'Admin Purchase',
  [UserRole.LEADER]: 'Leader',
  [UserRole.STAFF]: 'Staff',
  [UserRole.TEKNISI]: 'Teknisi',
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
// ============================================================================

const assetStatusLabelMap: Record<AssetStatus, string> = {
  [AssetStatus.IN_STORAGE]: 'Di Gudang',
  [AssetStatus.IN_USE]: 'Digunakan',
  [AssetStatus.ON_LOAN]: 'Dipinjam',
  [AssetStatus.IN_CUSTODY]: 'Dipegang (Custody)',
  [AssetStatus.UNDER_REPAIR]: 'Dalam Perbaikan',
  [AssetStatus.OUT_FOR_SERVICE]: 'Keluar (Service)',
  [AssetStatus.DAMAGED]: 'Rusak',
  [AssetStatus.AWAITING_RETURN]: 'Menunggu Pengembalian',
  [AssetStatus.CONSUMED]: 'Habis Terpakai',
  [AssetStatus.DISPOSED]: 'Diberhentikan',
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
// ============================================================================

const assetConditionLabelMap: Record<AssetCondition, string> = {
  [AssetCondition.BRAND_NEW]: 'Baru',
  [AssetCondition.GOOD]: 'Baik',
  [AssetCondition.USED_OKAY]: 'Bekas Layak Pakai',
  [AssetCondition.MINOR_DAMAGE]: 'Rusak Ringan',
  [AssetCondition.MAJOR_DAMAGE]: 'Rusak Berat',
  [AssetCondition.BROKEN]: 'Rusak Total',
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
// REQUEST STATUS MAPPINGS
// ============================================================================

const requestStatusLabelMap: Record<RequestStatus, string> = {
  [RequestStatus.PENDING]: 'Menunggu',
  [RequestStatus.LOGISTIC_APPROVED]: 'Disetujui Logistik',
  [RequestStatus.LOGISTIC_REJECTED]: 'Ditolak Logistik',
  [RequestStatus.PURCHASE_APPROVED]: 'Disetujui Purchase',
  [RequestStatus.PURCHASE_REJECTED]: 'Ditolak Purchase',
  [RequestStatus.ORDERED]: 'Proses Pembelian',
  [RequestStatus.ARRIVED]: 'Tiba',
  [RequestStatus.AWAITING_HANDOVER]: 'Siap Serah Terima',
  [RequestStatus.COMPLETED]: 'Selesai',
  [RequestStatus.REJECTED]: 'Ditolak',
};

export function mapRequestStatusToLabel(status: RequestStatus): string {
  return requestStatusLabelMap[status] || status;
}

export function mapLabelToRequestStatus(label: string): RequestStatus | null {
  const entry = Object.entries(requestStatusLabelMap).find(([_, v]) => v === label);
  return entry ? (entry[0] as RequestStatus) : null;
}

// ============================================================================
// LOAN STATUS MAPPINGS
// ============================================================================

const loanStatusLabelMap: Record<LoanStatus, string> = {
  [LoanStatus.PENDING]: 'Menunggu Persetujuan',
  [LoanStatus.APPROVED]: 'Disetujui',
  [LoanStatus.REJECTED]: 'Ditolak',
  [LoanStatus.ON_LOAN]: 'Dipinjam',
  [LoanStatus.RETURNED]: 'Dikembalikan',
};

export function mapLoanStatusToLabel(status: LoanStatus): string {
  return loanStatusLabelMap[status] || status;
}

export function mapLabelToLoanStatus(label: string): LoanStatus | null {
  const entry = Object.entries(loanStatusLabelMap).find(([_, v]) => v === label);
  return entry ? (entry[0] as LoanStatus) : null;
}

// ============================================================================
// ASSET RETURN STATUS MAPPINGS
// ============================================================================

const assetReturnStatusLabelMap: Record<AssetReturnStatus, string> = {
  [AssetReturnStatus.PENDING]: 'Menunggu Verifikasi',
  [AssetReturnStatus.APPROVED]: 'Disetujui',
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
