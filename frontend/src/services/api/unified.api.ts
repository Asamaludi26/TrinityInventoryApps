/**
 * Unified Data API Service
 *
 * Provides a single fetch point for all initial data loading,
 * eliminating redundant API calls across stores.
 *
 * Pure API calls - no mock logic.
 */

import { apiClient } from "./client";
import type {
  Asset,
  Request,
  Handover,
  Dismantle,
  Customer,
  User,
  Division,
  AssetCategory,
  Notification,
  LoanRequest,
  Maintenance,
  Installation,
  AssetReturn,
  StockMovement,
} from "../../types";
import {
  transformBackendAsset,
  transformBackendUser,
  transformBackendRequest,
  transformBackendLoanRequest,
  transformBackendCustomer,
} from "../../utils/enumMapper";

// Helper type untuk data mentah dari backend
// Record<string, unknown> lebih aman daripada any dan diterima oleh linter
type BackendDTO = Record<string, unknown>;

// --- TYPES ---
export interface UnifiedAppData {
  assets: Asset[];
  requests: Request[];
  handovers: Handover[];
  dismantles: Dismantle[];
  customers: Customer[];
  users: User[];
  divisions: Division[];
  categories: AssetCategory[];
  notifications: Notification[];
  loanRequests: LoanRequest[];
  maintenances: Maintenance[];
  installations: Installation[];
  returns: AssetReturn[];
  stockMovements: StockMovement[];
}

// --- UNIFIED API ---
export const unifiedApi = {
  /**
   * Fetch all application data in a single call.
   * Parallel API calls to backend for optimal performance.
   */
  fetchAllData: async (): Promise<UnifiedAppData> => {
    try {
      const [
        assetsRaw,
        requestsRaw,
        usersRaw,
        divisions,
        categories,
        customersRaw,
        loanRequestsRaw,
        handovers,
        installations,
        maintenances,
        dismantles,
        notifications,
      ] = await Promise.all([
        apiClient.get<BackendDTO[]>("/assets").catch(() => []),
        apiClient.get<BackendDTO[]>("/requests").catch(() => []),
        apiClient.get<BackendDTO[]>("/users").catch(() => []),
        apiClient.get<Division[]>("/divisions").catch(() => []),
        apiClient.get<AssetCategory[]>("/categories").catch(() => []),
        apiClient.get<BackendDTO[]>("/customers").catch(() => []),
        apiClient.get<BackendDTO[]>("/loan-requests").catch(() => []),
        apiClient.get<Handover[]>("/transactions/handovers").catch(() => []),
        apiClient.get<Installation[]>("/transactions/installations").catch(() => []),
        apiClient.get<Maintenance[]>("/transactions/maintenances").catch(() => []),
        apiClient.get<Dismantle[]>("/transactions/dismantles").catch(() => []),
        apiClient.get<Notification[]>("/notifications").catch(() => []),
      ]);

      // Transform backend data to frontend types
      // FIX: Menghapus 'as any' karena Record<string, unknown> kompatibel dengan transformer
      const assets = (assetsRaw || []).map((item) => transformBackendAsset(item));
      const requests = (requestsRaw || []).map((item) => transformBackendRequest(item));
      const users = (usersRaw || []).map((item) => transformBackendUser(item));
      const customers = (customersRaw || []).map((item) => transformBackendCustomer(item));
      const loanRequests = (loanRequestsRaw || []).map((item) => transformBackendLoanRequest(item));

      return {
        assets,
        requests,
        handovers: handovers || [],
        dismantles: dismantles || [],
        customers,
        users,
        divisions: divisions || [],
        categories: categories || [],
        notifications: notifications || [],
        loanRequests,
        maintenances: maintenances || [],
        installations: installations || [],
        returns: [], // Returns fetched separately when needed
        stockMovements: [], // Stock movements fetched separately when needed
      };
    } catch (error) {
      console.error("[UnifiedAPI] Failed to fetch all data:", error);
      throw error;
    }
  },

  /**
   * Refresh specific data domains
   */
  refreshAssets: async (): Promise<Asset[]> => {
    const response = await apiClient.get<BackendDTO[]>("/assets");
    return (response || []).map((item) => transformBackendAsset(item));
  },

  refreshRequests: async (): Promise<Request[]> => {
    const response = await apiClient.get<BackendDTO[]>("/requests");
    return (response || []).map((item) => transformBackendRequest(item));
  },

  refreshLoanRequests: async (): Promise<LoanRequest[]> => {
    const response = await apiClient.get<BackendDTO[]>("/loan-requests");
    return (response || []).map((item) => transformBackendLoanRequest(item));
  },

  refreshUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<BackendDTO[]>("/users");
    return (response || []).map((item) => transformBackendUser(item));
  },

  refreshCustomers: async (): Promise<Customer[]> => {
    const response = await apiClient.get<BackendDTO[]>("/customers");
    return (response || []).map((item) => transformBackendCustomer(item));
  },

  refreshCategories: async (): Promise<AssetCategory[]> => {
    return apiClient.get<AssetCategory[]>("/categories");
  },

  refreshNotifications: async (): Promise<Notification[]> => {
    return apiClient.get<Notification[]>("/notifications");
  },

  refreshTransactions: async () => {
    const [handovers, installations, maintenances, dismantles] = await Promise.all([
      apiClient.get<Handover[]>("/transactions/handovers").catch(() => []),
      apiClient.get<Installation[]>("/transactions/installations").catch(() => []),
      apiClient.get<Maintenance[]>("/transactions/maintenances").catch(() => []),
      apiClient.get<Dismantle[]>("/transactions/dismantles").catch(() => []),
    ]);

    return { handovers, installations, maintenances, dismantles };
  },
};

// --- DEPRECATED: Mock storage utilities (kept for backwards compatibility) ---
export const mockStorage = {
  get: <T>(_key: string): T | null => null,
  save: <T>(_key: string, _value: T): void => {},
  USE_MOCK: false,
};
