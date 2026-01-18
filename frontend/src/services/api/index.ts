/**
 * API Services - Barrel Export
 *
 * Centralized export for all API services.
 * Import from here rather than individual files.
 */

// Core client and utilities
export { apiClient, ApiError, USE_MOCK, API_URL } from "./client";

// Unified data loading
export { unifiedApi, mockStorage } from "./unified.api";
export type { UnifiedAppData } from "./unified.api";

// Domain-specific APIs
export { authApi } from "./auth.api";
export { assetsApi } from "./assets.api";
export { requestsApi } from "./requests.api";
export { loansApi, returnsApi } from "./loans.api";
export {
  handoversApi,
  installationsApi,
  maintenancesApi,
  dismantlesApi,
} from "./transactions.api";
export {
  usersApi,
  customersApi,
  divisionsApi,
  categoriesApi,
} from "./master-data.api";
export { stockApi } from "./stock.api";
export { notificationsApi } from "./notifications.api";
