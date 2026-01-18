/**
 * API Services - Legacy Compatibility Layer
 *
 * This file re-exports everything from the modular API structure
 * for backward compatibility with existing imports.
 *
 * @deprecated Import from './api/index' or './api' directory directly.
 */

// Re-export all from the modular API structure
export * from "./api/index";

// Legacy exports for backward compatibility
export { unifiedApi } from "./api/unified.api";
export { mockStorage } from "./api/unified.api";
export type { UnifiedAppData } from "./api/unified.api";

// Legacy function aliases
import { unifiedApi } from "./api/unified.api";

/**
 * @deprecated Use unifiedApi.fetchAllData() instead
 */
export const fetchAllData = unifiedApi.fetchAllData;

/**
 * @deprecated Use specific API services (assetsApi, requestsApi, etc.) instead
 */
export const updateData = async <T>(key: string, data: T): Promise<T> => {
  console.warn(
    "[api.ts] updateData is deprecated. Use specific API services instead.",
  );
  const { USE_MOCK } = await import("./api/client");
  const { mockStorage } = await import("./api/unified.api");
  if (USE_MOCK) {
    mockStorage.save(key, data);
    return data;
  }
  throw new Error(
    "updateData is for Mock Mode only. Use specific service methods for Real API.",
  );
};

// Legacy auth exports
import { authApi } from "./api/auth.api";
import type { User } from "../types";

/**
 * @deprecated Use authApi.login() instead. This returns User for backward compatibility.
 */
export const loginUser = async (email: string, pass: string): Promise<User> => {
  const response = await authApi.login(email, pass);
  return response.user;
};

/**
 * @deprecated Use authApi.requestPasswordReset() instead
 */
export const requestPasswordReset = authApi.requestPasswordReset;

// Legacy loan transaction approval
import { loansApi } from "./api/loans.api";

/**
 * @deprecated Use loansApi.approve() instead
 */
export const approveLoanTransaction = loansApi.approve;

// Legacy stock movement
import { stockApi } from "./api/stock.api";

/**
 * @deprecated Use stockApi.recordMovement() instead
 */
export const recordStockMovement = stockApi.recordMovement;
