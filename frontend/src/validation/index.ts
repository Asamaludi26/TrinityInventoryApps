/**
 * Validation Schemas - Barrel Export
 *
 * Centralized export for all Zod validation schemas.
 * Import from here rather than individual files.
 */

// Authentication schemas
export {
  loginSchema,
  changePasswordSchema,
  passwordResetRequestSchema,
  adminResetPasswordSchema,
  type LoginInput,
  type ChangePasswordInput,
  type PasswordResetRequestInput,
  type AdminResetPasswordInput,
} from "./schemas/auth.schema";

// User schemas
export {
  userRoles,
  userRoleSchema,
  permissionSchema,
  createUserSchema,
  updateUserSchema,
  divisionSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type DivisionInput,
} from "./schemas/user.schema";

// Asset schemas
export {
  assetStatusSchema,
  assetConditionSchema,
  attachmentSchema,
  activityLogEntrySchema,
  createAssetSchema,
  updateAssetSchema,
  batchUpdateAssetsSchema,
  consumeMaterialSchema,
  standardItemSchema,
  assetTypeSchema,
  assetCategorySchema,
  type CreateAssetInput,
  type UpdateAssetInput,
  type BatchUpdateAssetsInput,
  type ConsumeMaterialInput,
  type AssetCategoryInput,
} from "./schemas/asset.schema";

// Request schemas
export {
  orderTypeSchema,
  allocationTargetSchema,
  orderDetailsSchema,
  purchaseDetailsSchema,
  requestItemSchema,
  createRequestSchema,
  approveRequestSchema,
  rejectRequestSchema,
  loanItemSchema,
  createLoanRequestSchema,
  returnItemSchema,
  submitReturnSchema,
  verifyReturnItemSchema,
  verifyReturnSchema,
  type PurchaseDetailsInput,
  type RequestItemInput,
  type CreateRequestInput,
  type ApproveRequestInput,
  type RejectRequestInput,
  type LoanItemInput,
  type CreateLoanRequestInput,
  type SubmitReturnInput,
  type VerifyReturnInput,
} from "./schemas/request.schema";

// Transaction schemas
export {
  handoverItemSchema,
  createHandoverSchema,
  installationAssetSchema,
  installationMaterialSchema,
  createInstallationSchema,
  maintenanceReplacementSchema,
  maintenanceMaterialSchema,
  createMaintenanceSchema,
  createDismantleSchema,
  type HandoverItemInput,
  type CreateHandoverInput,
  type InstallationMaterialInput,
  type CreateInstallationInput,
  type CreateMaintenanceInput,
  type CreateDismantleInput,
} from "./schemas/transaction.schema";

// Customer schemas
export {
  customerStatusSchema,
  installedMaterialSchema,
  createCustomerSchema,
  updateCustomerSchema,
  customerFilterSchema,
  type CreateCustomerInput,
  type UpdateCustomerInput,
  type CustomerFilterInput,
} from "./schemas/customer.schema";
