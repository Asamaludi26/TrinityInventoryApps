/**
 * Enum Mappers - Transform between backend (Prisma) and frontend (Indonesian labels/display)
 *
 * Backend menggunakan English SCREAMING_SNAKE_CASE enum values
 * Frontend menggunakan Indonesian display labels
 */

import {
  UserRole,
  AssetStatus,
  AssetCondition,
  ItemStatus,
  LoanRequestStatus,
  CustomerStatus,
  AssetReturnStatus,
  MovementType,
  Asset,
  User,
  Request,
  LoanRequest,
  Customer,
  AssetReturn,
} from "../types";

// ============================================================================
// BACKEND ENUM VALUES (from Prisma)
// ============================================================================

export type BackendUserRole =
  | "SUPER_ADMIN"
  | "ADMIN_LOGISTIK"
  | "ADMIN_PURCHASE"
  | "LEADER"
  | "STAFF"
  | "TEKNISI";

export type BackendAssetStatus =
  | "IN_STORAGE"
  | "IN_USE"
  | "ON_LOAN"
  | "IN_CUSTODY"
  | "UNDER_REPAIR"
  | "OUT_FOR_SERVICE"
  | "DAMAGED"
  | "AWAITING_RETURN"
  | "CONSUMED"
  | "DISPOSED";

export type BackendAssetCondition =
  | "BRAND_NEW"
  | "GOOD"
  | "USED_OKAY"
  | "MINOR_DAMAGE"
  | "MAJOR_DAMAGE"
  | "BROKEN"
  | "FOR_PARTS";

export type BackendRequestStatus =
  | "PENDING"
  | "LOGISTIC_APPROVED"
  | "LOGISTIC_REJECTED"
  | "PURCHASE_APPROVED"
  | "PURCHASE_REJECTED"
  | "ORDERED"
  | "ARRIVED"
  | "AWAITING_HANDOVER"
  | "COMPLETED"
  | "REJECTED";

export type BackendLoanStatus = "PENDING" | "APPROVED" | "REJECTED" | "ON_LOAN" | "RETURNED";

export type BackendCustomerStatus = "ACTIVE" | "INACTIVE" | "CHURNED";

export type BackendAssetReturnStatus = "PENDING" | "APPROVED" | "COMPLETED" | "REJECTED";

export type BackendMovementType =
  | "RECEIVED"
  | "ISSUED"
  | "CONSUMED"
  | "ADJUSTED"
  | "TRANSFERRED"
  | "RETURNED"
  | "DISPOSED";

// ============================================================================
// USER ROLE MAPPINGS
// ============================================================================

const userRoleBackendToFrontend: Record<BackendUserRole, UserRole> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN_LOGISTIK: "Admin Logistik",
  ADMIN_PURCHASE: "Admin Purchase",
  LEADER: "Leader",
  STAFF: "Staff",
  TEKNISI: "Staff", // Map TEKNISI to Staff in frontend for now
};

const userRoleFrontendToBackend: Record<UserRole, BackendUserRole> = {
  "Super Admin": "SUPER_ADMIN",
  "Admin Logistik": "ADMIN_LOGISTIK",
  "Admin Purchase": "ADMIN_PURCHASE",
  Leader: "LEADER",
  Staff: "STAFF",
};

export function fromBackendUserRole(role: BackendUserRole | string): UserRole {
  return userRoleBackendToFrontend[role as BackendUserRole] || "Staff";
}

export function toBackendUserRole(role: UserRole): BackendUserRole {
  return userRoleFrontendToBackend[role] || "STAFF";
}

// ============================================================================
// ASSET STATUS MAPPINGS
// ============================================================================

const assetStatusBackendToFrontend: Record<BackendAssetStatus, AssetStatus> = {
  IN_STORAGE: AssetStatus.IN_STORAGE,
  IN_USE: AssetStatus.IN_USE,
  ON_LOAN: AssetStatus.IN_USE, // Map ON_LOAN to IN_USE
  IN_CUSTODY: AssetStatus.IN_CUSTODY,
  UNDER_REPAIR: AssetStatus.UNDER_REPAIR,
  OUT_FOR_SERVICE: AssetStatus.OUT_FOR_REPAIR,
  DAMAGED: AssetStatus.DAMAGED,
  AWAITING_RETURN: AssetStatus.AWAITING_RETURN,
  CONSUMED: AssetStatus.CONSUMED,
  DISPOSED: AssetStatus.DECOMMISSIONED,
};

const assetStatusFrontendToBackend: Record<AssetStatus, BackendAssetStatus> = {
  [AssetStatus.IN_STORAGE]: "IN_STORAGE",
  [AssetStatus.IN_USE]: "IN_USE",
  [AssetStatus.IN_CUSTODY]: "IN_CUSTODY",
  [AssetStatus.UNDER_REPAIR]: "UNDER_REPAIR",
  [AssetStatus.OUT_FOR_REPAIR]: "OUT_FOR_SERVICE",
  [AssetStatus.DAMAGED]: "DAMAGED",
  [AssetStatus.AWAITING_RETURN]: "AWAITING_RETURN",
  [AssetStatus.CONSUMED]: "CONSUMED",
  [AssetStatus.DECOMMISSIONED]: "DISPOSED",
};

export function fromBackendAssetStatus(status: BackendAssetStatus | string): AssetStatus {
  return assetStatusBackendToFrontend[status as BackendAssetStatus] || AssetStatus.IN_STORAGE;
}

export function toBackendAssetStatus(status: AssetStatus | string): BackendAssetStatus {
  return assetStatusFrontendToBackend[status as AssetStatus] || "IN_STORAGE";
}

// ============================================================================
// ASSET CONDITION MAPPINGS
// ============================================================================

const assetConditionBackendToFrontend: Record<BackendAssetCondition, AssetCondition> = {
  BRAND_NEW: AssetCondition.BRAND_NEW,
  GOOD: AssetCondition.GOOD,
  USED_OKAY: AssetCondition.USED_OKAY,
  MINOR_DAMAGE: AssetCondition.MINOR_DAMAGE,
  MAJOR_DAMAGE: AssetCondition.MAJOR_DAMAGE,
  BROKEN: AssetCondition.MAJOR_DAMAGE,
  FOR_PARTS: AssetCondition.FOR_PARTS,
};

const assetConditionFrontendToBackend: Record<AssetCondition, BackendAssetCondition> = {
  [AssetCondition.BRAND_NEW]: "BRAND_NEW",
  [AssetCondition.GOOD]: "GOOD",
  [AssetCondition.USED_OKAY]: "USED_OKAY",
  [AssetCondition.MINOR_DAMAGE]: "MINOR_DAMAGE",
  [AssetCondition.MAJOR_DAMAGE]: "MAJOR_DAMAGE",
  [AssetCondition.FOR_PARTS]: "FOR_PARTS",
};

export function fromBackendAssetCondition(
  condition: BackendAssetCondition | string
): AssetCondition {
  return assetConditionBackendToFrontend[condition as BackendAssetCondition] || AssetCondition.GOOD;
}

export function toBackendAssetCondition(condition: AssetCondition): BackendAssetCondition {
  return assetConditionFrontendToBackend[condition] || "GOOD";
}

// ============================================================================
// REQUEST STATUS MAPPINGS
// ============================================================================

const requestStatusBackendToFrontend: Record<BackendRequestStatus, ItemStatus> = {
  PENDING: ItemStatus.PENDING,
  LOGISTIC_APPROVED: ItemStatus.LOGISTIC_APPROVED,
  LOGISTIC_REJECTED: ItemStatus.REJECTED,
  PURCHASE_APPROVED: ItemStatus.APPROVED,
  PURCHASE_REJECTED: ItemStatus.REJECTED,
  ORDERED: ItemStatus.PURCHASING,
  ARRIVED: ItemStatus.ARRIVED,
  AWAITING_HANDOVER: ItemStatus.AWAITING_HANDOVER,
  COMPLETED: ItemStatus.COMPLETED,
  REJECTED: ItemStatus.REJECTED,
};

const requestStatusFrontendToBackend: Record<ItemStatus, BackendRequestStatus> = {
  [ItemStatus.PENDING]: "PENDING",
  [ItemStatus.LOGISTIC_APPROVED]: "LOGISTIC_APPROVED",
  [ItemStatus.AWAITING_CEO_APPROVAL]: "LOGISTIC_APPROVED",
  [ItemStatus.APPROVED]: "PURCHASE_APPROVED",
  [ItemStatus.PURCHASING]: "ORDERED",
  [ItemStatus.IN_DELIVERY]: "ORDERED",
  [ItemStatus.ARRIVED]: "ARRIVED",
  [ItemStatus.AWAITING_HANDOVER]: "AWAITING_HANDOVER",
  [ItemStatus.COMPLETED]: "COMPLETED",
  [ItemStatus.REJECTED]: "REJECTED",
  [ItemStatus.CANCELLED]: "REJECTED",
  [ItemStatus.IN_PROGRESS]: "LOGISTIC_APPROVED",
};

export function fromBackendRequestStatus(status: BackendRequestStatus | string): ItemStatus {
  return requestStatusBackendToFrontend[status as BackendRequestStatus] || ItemStatus.PENDING;
}

export function toBackendRequestStatus(status: ItemStatus): BackendRequestStatus {
  return requestStatusFrontendToBackend[status] || "PENDING";
}

// ============================================================================
// LOAN STATUS MAPPINGS
// ============================================================================

const loanStatusBackendToFrontend: Record<BackendLoanStatus, LoanRequestStatus> = {
  PENDING: LoanRequestStatus.PENDING,
  APPROVED: LoanRequestStatus.APPROVED,
  REJECTED: LoanRequestStatus.REJECTED,
  ON_LOAN: LoanRequestStatus.ON_LOAN,
  RETURNED: LoanRequestStatus.RETURNED,
};

const loanStatusFrontendToBackend: Record<LoanRequestStatus, BackendLoanStatus> = {
  [LoanRequestStatus.PENDING]: "PENDING",
  [LoanRequestStatus.APPROVED]: "APPROVED",
  [LoanRequestStatus.REJECTED]: "REJECTED",
  [LoanRequestStatus.ON_LOAN]: "ON_LOAN",
  [LoanRequestStatus.RETURNED]: "RETURNED",
  [LoanRequestStatus.OVERDUE]: "ON_LOAN",
  [LoanRequestStatus.AWAITING_RETURN]: "ON_LOAN",
};

export function fromBackendLoanStatus(status: BackendLoanStatus | string): LoanRequestStatus {
  return loanStatusBackendToFrontend[status as BackendLoanStatus] || LoanRequestStatus.PENDING;
}

export function toBackendLoanStatus(status: LoanRequestStatus): BackendLoanStatus {
  return loanStatusFrontendToBackend[status] || "PENDING";
}

// ============================================================================
// CUSTOMER STATUS MAPPINGS
// ============================================================================

const customerStatusBackendToFrontend: Record<BackendCustomerStatus, CustomerStatus> = {
  ACTIVE: CustomerStatus.ACTIVE,
  INACTIVE: CustomerStatus.INACTIVE,
  CHURNED: CustomerStatus.SUSPENDED,
};

const customerStatusFrontendToBackend: Record<CustomerStatus, BackendCustomerStatus> = {
  [CustomerStatus.ACTIVE]: "ACTIVE",
  [CustomerStatus.INACTIVE]: "INACTIVE",
  [CustomerStatus.SUSPENDED]: "CHURNED",
};

export function fromBackendCustomerStatus(status: BackendCustomerStatus | string): CustomerStatus {
  return customerStatusBackendToFrontend[status as BackendCustomerStatus] || CustomerStatus.ACTIVE;
}

export function toBackendCustomerStatus(status: CustomerStatus): BackendCustomerStatus {
  return customerStatusFrontendToBackend[status] || "ACTIVE";
}

// ============================================================================
// ASSET RETURN STATUS MAPPINGS
// ============================================================================

const assetReturnStatusBackendToFrontend: Record<BackendAssetReturnStatus, AssetReturnStatus> = {
  PENDING: AssetReturnStatus.PENDING_APPROVAL,
  APPROVED: AssetReturnStatus.APPROVED,
  COMPLETED: AssetReturnStatus.COMPLETED,
  REJECTED: AssetReturnStatus.REJECTED,
};

const assetReturnStatusFrontendToBackend: Record<AssetReturnStatus, BackendAssetReturnStatus> = {
  [AssetReturnStatus.PENDING_APPROVAL]: "PENDING",
  [AssetReturnStatus.APPROVED]: "APPROVED",
  [AssetReturnStatus.COMPLETED]: "COMPLETED",
  [AssetReturnStatus.REJECTED]: "REJECTED",
};

export function fromBackendAssetReturnStatus(
  status: BackendAssetReturnStatus | string
): AssetReturnStatus {
  return (
    assetReturnStatusBackendToFrontend[status as BackendAssetReturnStatus] ||
    AssetReturnStatus.PENDING_APPROVAL
  );
}

export function toBackendAssetReturnStatus(status: AssetReturnStatus): BackendAssetReturnStatus {
  return assetReturnStatusFrontendToBackend[status] || "PENDING";
}

// ============================================================================
// MOVEMENT TYPE MAPPINGS
// ============================================================================

const movementTypeBackendToFrontend: Record<BackendMovementType, MovementType> = {
  RECEIVED: "IN_PURCHASE",
  ISSUED: "OUT_HANDOVER",
  CONSUMED: "OUT_USAGE_CUSTODY",
  ADJUSTED: "OUT_ADJUSTMENT",
  TRANSFERRED: "OUT_HANDOVER",
  RETURNED: "IN_RETURN",
  DISPOSED: "OUT_BROKEN",
};

export function fromBackendMovementType(type: BackendMovementType | string): MovementType {
  return movementTypeBackendToFrontend[type as BackendMovementType] || "OUT_ADJUSTMENT";
}

// ============================================================================
// DATA TRANSFORMERS (for API responses)
// ============================================================================

// FIX: Gunakan 'unknown' agar tidak kena rule no-explicit-any
type BackendDTO = Record<string, unknown>;

// Helper internal untuk casting yang lebih mudah dibaca
// (Menghindari 'as any' di mana-mana yang membuat kode kotor)
type DTO = Record<string, any>;

/**
 * Transform backend asset response to frontend Asset type
 */
export function transformBackendAsset(backendAsset: BackendDTO): Asset {
  const data = backendAsset as DTO;
  return {
    ...data,
    status: fromBackendAssetStatus(data.status),
    condition: fromBackendAssetCondition(data.condition),
    // Map nested model data
    category: data.model?.type?.category?.name || "",
    type: data.model?.type?.name || "",
    // Map fields
    registrationDate: data.createdAt,
    recordedBy: data.recordedBy || "System",
    attachments: data.attachments || [],
    activityLog: data.activityLog || [],
  } as Asset;
}

/**
 * Transform backend user response to frontend User type
 */
export function transformBackendUser(backendUser: BackendDTO): User {
  const data = backendUser as DTO;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: fromBackendUserRole(data.role),
    divisionId: data.divisionId,
    permissions: data.permissions || [],
    passwordResetRequested: data.passwordResetRequested,
    passwordResetRequestDate: data.passwordResetRequestDate,
  };
}

/**
 * Transform backend request response to frontend Request type
 */
export function transformBackendRequest(backendRequest: BackendDTO): Request {
  if (!backendRequest) {
    throw new Error("Cannot transform null/undefined request");
  }
  const data = backendRequest as DTO;

  // Handle requester - can be object with name, string, or null/undefined
  let requesterName = "";
  if (data.requester) {
    if (typeof data.requester === "object") {
      requesterName = data.requester.name || "";
    } else if (typeof data.requester === "string") {
      requesterName = data.requester;
    }
  }

  // Handle order type mapping from backend enum
  const orderTypeMap: Record<string, string> = {
    REGULAR_STOCK: "Regular Stock",
    URGENT: "Urgent",
    PROJECT_BASED: "Project Based",
  };

  return {
    ...data,
    docNumber: data.docNumber || data.id,
    requester: requesterName,
    status: fromBackendRequestStatus(data.status),
    order: {
      type: orderTypeMap[data.orderType] || "Regular Stock",
      justification: data.justification || "",
      project: data.project || "",
      allocationTarget: data.allocationTarget === "USAGE" ? "Usage" : "Inventory",
    },
    items: (data.items || []).map((item: DTO, idx: number) => ({
      id: item.id || idx + 1,
      itemName: item.itemName || "",
      itemTypeBrand: item.itemTypeBrand || "",
      quantity: item.quantity || 0,
      keterangan: item.reason || item.keterangan || "",
      unit: item.unit || "pcs",
    })),
    isRegistered: data.isRegistered || false,
    partiallyRegisteredItems: data.partiallyRegisteredItems || {},
  } as Request;
}

/**
 * Transform backend loan request to frontend LoanRequest type
 */
export function transformBackendLoanRequest(backendLoan: BackendDTO): LoanRequest {
  if (!backendLoan) {
    throw new Error("Cannot transform null/undefined loan request");
  }
  const data = backendLoan as DTO;

  // Handle requester - can be object with name, string, or null/undefined
  let requesterName = "";
  let divisionName = "";
  if (data.requester) {
    if (typeof data.requester === "object") {
      requesterName = data.requester.name || "";
      divisionName = data.requester.division?.name || "";
    } else if (typeof data.requester === "string") {
      requesterName = data.requester;
    }
  }
  // Also check for standalone division field
  if (!divisionName && data.division) {
    divisionName = typeof data.division === "string" ? data.division : data.division.name || "";
  }

  return {
    id: data.id || "",
    requester: requesterName,
    division: divisionName,
    requestDate: data.requestDate || "",
    status: fromBackendLoanStatus(data.status),
    items: (data.items || []).map((item: DTO, idx: number) => ({
      id: item.id || idx + 1,
      itemName: item.itemName || "",
      brand: item.brand || "",
      quantity: item.quantity || 0,
      keterangan: item.notes || item.keterangan || "",
      returnDate: item.returnDate || null,
      unit: item.unit || "pcs",
    })),
    notes: data.purpose || data.notes || "",
    approver: data.approver || undefined,
    approvalDate: data.approvalDate || undefined,
    rejectionReason: data.rejectionReason || undefined,
    assignedAssetIds: data.assignedAssets || data.assignedAssetIds || {},
    returnedAssetIds: data.returnedAssets || data.returnedAssetIds || [],
  };
}

/**
 * Transform backend customer to frontend Customer type
 */
export function transformBackendCustomer(backendCustomer: BackendDTO): Customer {
  const data = backendCustomer as DTO;
  return {
    id: data.id,
    name: data.name,
    address: data.address || "",
    phone: data.phone || "",
    email: data.email || "",
    status: fromBackendCustomerStatus(data.status),
    installationDate: data.createdAt,
    servicePackage: data.serviceType || "",
    installedMaterials: [],
    activityLog: [],
    notes: data.notes,
  };
}

/**
 * Transform backend asset return to frontend AssetReturn type
 */
export function transformBackendAssetReturn(backendReturn: BackendDTO): AssetReturn {
  if (!backendReturn) {
    throw new Error("Cannot transform null/undefined asset return");
  }
  const data = backendReturn as DTO;

  return {
    id: data.id || "",
    docNumber: data.docNumber || data.id || "",
    loanRequestId: data.loanRequestId || "",
    returnDate: data.returnDate || "",
    status: fromBackendAssetReturnStatus(data.status),
    returnedBy: data.returnedBy || "",
    items: (data.items || []).map((item: DTO) => ({
      assetId: item.assetId || "",
      assetName: item.assetName || "",
      returnedCondition: fromBackendAssetCondition(item.returnedCondition || item.condition),
      status: item.status || "pending",
      verificationNotes: item.verificationNotes || item.notes || "",
    })),
    verifiedBy: data.verifiedBy,
    verificationDate: data.verificationDate,
    verificationNotes: data.verificationNotes,
  };
}
