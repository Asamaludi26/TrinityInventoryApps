/**
 * Query Hooks Barrel Export
 *
 * Central export for all TanStack Query hooks.
 */

// Auth hooks
export {
  useLogin,
  useLogout,
  useRequestPasswordReset,
  useUpdatePassword,
} from "./useAuthQueries";

// Asset hooks
export {
  assetKeys,
  useAssets,
  useAsset,
  useCreateAsset,
  useUpdateAsset,
  useBatchUpdateAssets,
  useDeleteAsset,
  useConsumeMaterial,
} from "./useAssetQueries";

// Request hooks
export {
  requestKeys,
  loanKeys,
  returnKeys,
  useRequests,
  useRequest,
  useCreateRequest,
  useUpdateRequest,
  useApproveRequest,
  useRejectRequest,
  useCancelRequest,
  useFillPurchaseDetails,
  useDeleteRequest,
  useLoanRequests,
  useLoanRequest,
  useCreateLoanRequest,
  useApproveLoanRequest,
  useRejectLoanRequest,
  useDeleteLoanRequest,
  useReturns,
  useReturn,
  useSubmitReturn,
  useVerifyReturn,
} from "./useRequestQueries";

// Transaction hooks
export {
  handoverKeys,
  installationKeys,
  maintenanceKeys,
  dismantleKeys,
  useHandovers,
  useHandover,
  useCreateHandover,
  useDeleteHandover,
  useInstallations,
  useInstallation,
  useCreateInstallation,
  useDeleteInstallation,
  useMaintenances,
  useMaintenance,
  useCreateMaintenance,
  useUpdateMaintenance,
  useCompleteMaintenance,
  useDeleteMaintenance,
  useDismantles,
  useDismantle,
  useCreateDismantle,
  useUpdateDismantle,
  useCompleteDismantle,
  useDeleteDismantle,
} from "./useTransactionQueries";

// Master data hooks
export {
  userKeys,
  customerKeys,
  divisionKeys,
  categoryKeys,
  stockKeys,
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useResetUserPassword,
  useCustomers,
  useCustomer,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useUpdateCustomerStatus,
  useDivisions,
  useCreateDivision,
  useUpdateDivision,
  useDeleteDivision,
  useCategories,
  useUpdateCategories,
  useStockMovements,
  useRecordStockMovement,
} from "./useMasterDataQueries";
