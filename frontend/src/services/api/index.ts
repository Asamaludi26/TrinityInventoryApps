/**
 * API Services - Barrel Export
 *
 * Centralized export for all API services.
 * Import from here rather than individual files.
 */

// Core client and utilities
export { apiClient, ApiError, USE_MOCK, API_URL } from "./client";

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
  stockApi,
} from "./master-data.api";
