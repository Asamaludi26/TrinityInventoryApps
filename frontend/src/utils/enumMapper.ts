/**
 * Enum Mappers - Transform between backend (Prisma) and frontend (Indonesian labels/display)
 *
 * Backend menggunakan English SCREAMING_SNAKE_CASE enum values
 * Frontend menggunakan Indonesian display labels
 *
 * @example
 * import { fromBackendAssetStatus, toBackendAssetStatus } from './enumMapper';
 *
 * const label = fromBackendAssetStatus('IN_STORAGE'); // 'Di Gudang'
 * const status = toBackendAssetStatus('Di Gudang'); // 'IN_STORAGE'
 */

import {
  UserRole,
  AssetStatus,
  AssetCondition,
  ItemStatus,
  LoanRequestStatus,
  CustomerStatus,
  AssetReturnStatus,
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

export type BackendLoanStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ON_LOAN"
  | "RETURNED";

export type BackendCustomerStatus = "ACTIVE" | "INACTIVE" | "CHURNED";

export type BackendAssetReturnStatus =
  | "PENDING"
  | "APPROVED"
  | "COMPLETED"
  | "REJECTED";

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
  ON_LOAN: AssetStatus.IN_USE, // Map ON_LOAN to IN_USE (or add to frontend enum)
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

export function fromBackendAssetStatus(
  status: BackendAssetStatus | string,
): AssetStatus {
  return (
    assetStatusBackendToFrontend[status as BackendAssetStatus] ||
    AssetStatus.IN_STORAGE
  );
}

export function toBackendAssetStatus(
  status: AssetStatus | string,
): BackendAssetStatus {
  return assetStatusFrontendToBackend[status as AssetStatus] || "IN_STORAGE";
}

// ============================================================================
// ASSET CONDITION MAPPINGS
// ============================================================================

const assetConditionBackendToFrontend: Record<
  BackendAssetCondition,
  AssetCondition
> = {
  BRAND_NEW: AssetCondition.BRAND_NEW,
  GOOD: AssetCondition.GOOD,
  USED_OKAY: AssetCondition.USED_OKAY,
  MINOR_DAMAGE: AssetCondition.MINOR_DAMAGE,
  MAJOR_DAMAGE: AssetCondition.MAJOR_DAMAGE,
  BROKEN: AssetCondition.MAJOR_DAMAGE, // Map BROKEN to MAJOR_DAMAGE
  FOR_PARTS: AssetCondition.FOR_PARTS,
};

const assetConditionFrontendToBackend: Record<
  AssetCondition,
  BackendAssetCondition
> = {
  [AssetCondition.BRAND_NEW]: "BRAND_NEW",
  [AssetCondition.GOOD]: "GOOD",
  [AssetCondition.USED_OKAY]: "USED_OKAY",
  [AssetCondition.MINOR_DAMAGE]: "MINOR_DAMAGE",
  [AssetCondition.MAJOR_DAMAGE]: "MAJOR_DAMAGE",
  [AssetCondition.FOR_PARTS]: "FOR_PARTS",
};

export function fromBackendAssetCondition(
  condition: BackendAssetCondition | string,
): AssetCondition {
  return (
    assetConditionBackendToFrontend[condition as BackendAssetCondition] ||
    AssetCondition.GOOD
  );
}

export function toBackendAssetCondition(
  condition: AssetCondition,
): BackendAssetCondition {
  return assetConditionFrontendToBackend[condition] || "GOOD";
}

// ============================================================================
// REQUEST STATUS MAPPINGS
// ============================================================================

const requestStatusBackendToFrontend: Record<BackendRequestStatus, ItemStatus> =
  {
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

const requestStatusFrontendToBackend: Record<ItemStatus, BackendRequestStatus> =
  {
    [ItemStatus.PENDING]: "PENDING",
    [ItemStatus.LOGISTIC_APPROVED]: "LOGISTIC_APPROVED",
    [ItemStatus.AWAITING_CEO_APPROVAL]: "LOGISTIC_APPROVED", // Map to LOGISTIC_APPROVED
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

export function fromBackendRequestStatus(
  status: BackendRequestStatus | string,
): ItemStatus {
  return (
    requestStatusBackendToFrontend[status as BackendRequestStatus] ||
    ItemStatus.PENDING
  );
}

export function toBackendRequestStatus(
  status: ItemStatus,
): BackendRequestStatus {
  return requestStatusFrontendToBackend[status] || "PENDING";
}

// ============================================================================
// LOAN STATUS MAPPINGS
// ============================================================================

const loanStatusBackendToFrontend: Record<
  BackendLoanStatus,
  LoanRequestStatus
> = {
  PENDING: LoanRequestStatus.PENDING,
  APPROVED: LoanRequestStatus.APPROVED,
  REJECTED: LoanRequestStatus.REJECTED,
  ON_LOAN: LoanRequestStatus.ON_LOAN,
  RETURNED: LoanRequestStatus.RETURNED,
};

const loanStatusFrontendToBackend: Record<
  LoanRequestStatus,
  BackendLoanStatus
> = {
  [LoanRequestStatus.PENDING]: "PENDING",
  [LoanRequestStatus.APPROVED]: "APPROVED",
  [LoanRequestStatus.REJECTED]: "REJECTED",
  [LoanRequestStatus.ON_LOAN]: "ON_LOAN",
  [LoanRequestStatus.RETURNED]: "RETURNED",
  [LoanRequestStatus.OVERDUE]: "ON_LOAN", // Map OVERDUE to ON_LOAN
  [LoanRequestStatus.AWAITING_RETURN]: "ON_LOAN", // Map to ON_LOAN
};

export function fromBackendLoanStatus(
  status: BackendLoanStatus | string,
): LoanRequestStatus {
  return (
    loanStatusBackendToFrontend[status as BackendLoanStatus] ||
    LoanRequestStatus.PENDING
  );
}

export function toBackendLoanStatus(
  status: LoanRequestStatus,
): BackendLoanStatus {
  return loanStatusFrontendToBackend[status] || "PENDING";
}

// ============================================================================
// CUSTOMER STATUS MAPPINGS
// ============================================================================

const customerStatusBackendToFrontend: Record<
  BackendCustomerStatus,
  CustomerStatus
> = {
  ACTIVE: CustomerStatus.ACTIVE,
  INACTIVE: CustomerStatus.INACTIVE,
  CHURNED: CustomerStatus.SUSPENDED, // Map CHURNED to Suspended
};

const customerStatusFrontendToBackend: Record<
  CustomerStatus,
  BackendCustomerStatus
> = {
  [CustomerStatus.ACTIVE]: "ACTIVE",
  [CustomerStatus.INACTIVE]: "INACTIVE",
  [CustomerStatus.SUSPENDED]: "CHURNED",
};

export function fromBackendCustomerStatus(
  status: BackendCustomerStatus | string,
): CustomerStatus {
  return (
    customerStatusBackendToFrontend[status as BackendCustomerStatus] ||
    CustomerStatus.ACTIVE
  );
}

export function toBackendCustomerStatus(
  status: CustomerStatus,
): BackendCustomerStatus {
  return customerStatusFrontendToBackend[status] || "ACTIVE";
}

// ============================================================================
// ASSET RETURN STATUS MAPPINGS
// ============================================================================

const assetReturnStatusBackendToFrontend: Record<
  BackendAssetReturnStatus,
  AssetReturnStatus
> = {
  PENDING: AssetReturnStatus.PENDING_APPROVAL,
  APPROVED: AssetReturnStatus.APPROVED,
  COMPLETED: AssetReturnStatus.COMPLETED,
  REJECTED: AssetReturnStatus.REJECTED,
};

const assetReturnStatusFrontendToBackend: Record<
  AssetReturnStatus,
  BackendAssetReturnStatus
> = {
  [AssetReturnStatus.PENDING_APPROVAL]: "PENDING",
  [AssetReturnStatus.APPROVED]: "APPROVED",
  [AssetReturnStatus.COMPLETED]: "COMPLETED",
  [AssetReturnStatus.REJECTED]: "REJECTED",
};

export function fromBackendAssetReturnStatus(
  status: BackendAssetReturnStatus | string,
): AssetReturnStatus {
  return (
    assetReturnStatusBackendToFrontend[status as BackendAssetReturnStatus] ||
    AssetReturnStatus.PENDING_APPROVAL
  );
}

export function toBackendAssetReturnStatus(
  status: AssetReturnStatus,
): BackendAssetReturnStatus {
  return assetReturnStatusFrontendToBackend[status] || "PENDING";
}

// ============================================================================
// MOVEMENT TYPE MAPPINGS
// ============================================================================

import type { MovementType } from "../types";

const movementTypeBackendToFrontend: Record<BackendMovementType, MovementType> =
  {
    RECEIVED: "IN_PURCHASE",
    ISSUED: "OUT_HANDOVER",
    CONSUMED: "OUT_USAGE_CUSTODY",
    ADJUSTED: "OUT_ADJUSTMENT",
    TRANSFERRED: "OUT_HANDOVER",
    RETURNED: "IN_RETURN",
    DISPOSED: "OUT_BROKEN",
  };

export function fromBackendMovementType(
  type: BackendMovementType | string,
): MovementType {
  return (
    movementTypeBackendToFrontend[type as BackendMovementType] ||
    "OUT_ADJUSTMENT"
  );
}

// ============================================================================
// DATA TRANSFORMERS (for API responses)
// ============================================================================

import type {
  Asset,
  User,
  Request,
  LoanRequest,
  Customer,
  AssetReturn,
} from "../types";

/**
 * Transform backend asset response to frontend Asset type
 */
export function transformBackendAsset(backendAsset: any): Asset {
  return {
    ...backendAsset,
    status: fromBackendAssetStatus(backendAsset.status),
    condition: fromBackendAssetCondition(backendAsset.condition),
    // Map nested model data
    category: backendAsset.model?.type?.category?.name || "",
    type: backendAsset.model?.type?.name || "",
    // Map fields
    registrationDate: backendAsset.createdAt,
    recordedBy: backendAsset.recordedBy || "System",
    attachments: backendAsset.attachments || [],
    activityLog: backendAsset.activityLog || [],
  };
}

/**
 * Transform backend user response to frontend User type
 */
export function transformBackendUser(backendUser: any): User {
  return {
    id: backendUser.id,
    name: backendUser.name,
    email: backendUser.email,
    role: fromBackendUserRole(backendUser.role),
    divisionId: backendUser.divisionId,
    permissions: backendUser.permissions || [],
    passwordResetRequested: backendUser.passwordResetRequested,
    passwordResetRequestDate: backendUser.passwordResetRequestDate,
  };
}

/**
 * Transform backend request response to frontend Request type
 */
export function transformBackendRequest(backendRequest: any): Request {
  if (!backendRequest) {
    throw new Error("Cannot transform null/undefined request");
  }

  // Handle requester - can be object with name, string, or null/undefined
  let requesterName = "";
  if (backendRequest.requester) {
    if (typeof backendRequest.requester === "object") {
      requesterName = backendRequest.requester.name || "";
    } else if (typeof backendRequest.requester === "string") {
      requesterName = backendRequest.requester;
    }
  }

  // Handle order type mapping from backend enum
  const orderTypeMap: Record<string, string> = {
    REGULAR_STOCK: "Regular Stock",
    URGENT: "Urgent",
    PROJECT_BASED: "Project Based",
  };

  return {
    ...backendRequest,
    docNumber: backendRequest.docNumber || backendRequest.id,
    requester: requesterName,
    status: fromBackendRequestStatus(backendRequest.status),
    order: {
      type: orderTypeMap[backendRequest.orderType] || "Regular Stock",
      justification: backendRequest.justification || "",
      project: backendRequest.project || "",
      allocationTarget:
        backendRequest.allocationTarget === "USAGE" ? "Usage" : "Inventory",
    },
    items: (backendRequest.items || []).map((item: any, idx: number) => ({
      id: item.id || idx + 1,
      itemName: item.itemName || "",
      itemTypeBrand: item.itemTypeBrand || "",
      quantity: item.quantity || 0,
      keterangan: item.reason || item.keterangan || "",
      unit: item.unit || "pcs",
    })),
    isRegistered: backendRequest.isRegistered || false,
    partiallyRegisteredItems: backendRequest.partiallyRegisteredItems || {},
  };
}

/**
 * Transform backend loan request to frontend LoanRequest type
 */
export function transformBackendLoanRequest(backendLoan: any): LoanRequest {
  if (!backendLoan) {
    throw new Error("Cannot transform null/undefined loan request");
  }

  // Handle requester - can be object with name, string, or null/undefined
  let requesterName = "";
  let divisionName = "";
  if (backendLoan.requester) {
    if (typeof backendLoan.requester === "object") {
      requesterName = backendLoan.requester.name || "";
      divisionName = backendLoan.requester.division?.name || "";
    } else if (typeof backendLoan.requester === "string") {
      requesterName = backendLoan.requester;
    }
  }
  // Also check for standalone division field
  if (!divisionName && backendLoan.division) {
    divisionName =
      typeof backendLoan.division === "string"
        ? backendLoan.division
        : backendLoan.division.name || "";
  }

  return {
    id: backendLoan.id || "",
    requester: requesterName,
    division: divisionName,
    requestDate: backendLoan.requestDate || "",
    status: fromBackendLoanStatus(backendLoan.status),
    items: (backendLoan.items || []).map((item: any, idx: number) => ({
      id: item.id || idx + 1,
      itemName: item.itemName || "",
      brand: item.brand || "",
      quantity: item.quantity || 0,
      keterangan: item.notes || item.keterangan || "",
      returnDate: item.returnDate || null,
      unit: item.unit || "pcs",
    })),
    notes: backendLoan.purpose || backendLoan.notes || "",
    approver: backendLoan.approver || undefined,
    approvalDate: backendLoan.approvalDate || undefined,
    rejectionReason: backendLoan.rejectionReason || undefined,
    assignedAssetIds:
      backendLoan.assignedAssets || backendLoan.assignedAssetIds || {},
    returnedAssetIds:
      backendLoan.returnedAssets || backendLoan.returnedAssetIds || [],
  };
}

/**
 * Transform backend customer to frontend Customer type
 */
export function transformBackendCustomer(backendCustomer: any): Customer {
  return {
    id: backendCustomer.id,
    name: backendCustomer.name,
    address: backendCustomer.address || "",
    phone: backendCustomer.phone || "",
    email: backendCustomer.email || "",
    status:
      backendCustomer.status === "ACTIVE"
        ? ("Active" as any)
        : backendCustomer.status === "INACTIVE"
          ? ("Inactive" as any)
          : ("Suspended" as any),
    installationDate: backendCustomer.createdAt,
    servicePackage: backendCustomer.serviceType || "",
    installedMaterials: [],
    activityLog: [],
    notes: backendCustomer.notes,
  };
}

/**
 * Transform backend asset return to frontend AssetReturn type
 */
export function transformBackendAssetReturn(backendReturn: any): AssetReturn {
  if (!backendReturn) {
    throw new Error("Cannot transform null/undefined asset return");
  }

  return {
    id: backendReturn.id || "",
    docNumber: backendReturn.docNumber || backendReturn.id || "",
    loanRequestId: backendReturn.loanRequestId || "",
    returnDate: backendReturn.returnDate || "",
    status: fromBackendAssetReturnStatus(backendReturn.status),
    returnedBy: backendReturn.returnedBy || "",
    items: (backendReturn.items || []).map((item: any) => ({
      assetId: item.assetId || "",
      assetName: item.assetName || "",
      returnedCondition: fromBackendAssetCondition(
        item.returnedCondition || item.condition,
      ),
      status: item.status || "pending",
      verificationNotes: item.verificationNotes || item.notes || "",
    })),
    verifiedBy: backendReturn.verifiedBy,
    verificationDate: backendReturn.verificationDate,
    notes: backendReturn.notes,
  };
}
