/**
 * Unified Data API Service
 *
 * Provides a single fetch point for all initial data loading,
 * eliminating redundant API calls across stores.
 */

import { apiClient, USE_MOCK, ApiError } from "./client";
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

// Mock data imports
import {
  initialMockRequests,
  mockAssets,
  mockHandovers,
  mockDismantles,
  initialMockUsers,
  mockDivisions,
  mockCustomers,
  initialAssetCategories,
  mockNotifications,
  mockLoanRequests,
  mockMaintenances,
  mockInstallations,
  mockReturns,
  mockStockMovements,
} from "../../data/mockData";

// --- MOCK HELPERS ---
const MOCK_LATENCY = 300;

const getFromStorage = <T>(key: string): T | null => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const saveToStorage = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

const mockDelay = <T>(fn: () => T): Promise<T> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(fn());
      } catch (e) {
        reject(e);
      }
    }, MOCK_LATENCY);
  });

// --- DATA VERSIONING ---
const DATA_VERSION = "v2.0-unified";

const initializeMockData = () => {
  if (!USE_MOCK) return;

  const currentVersion = localStorage.getItem("app_data_version");

  if (currentVersion !== DATA_VERSION) {
    console.log(
      `[UnifiedAPI] Data migration (${currentVersion || "none"} -> ${DATA_VERSION})...`,
    );
    localStorage.setItem("app_data_version", DATA_VERSION);
  }

  const init = <T>(key: string, data: T) => {
    if (!localStorage.getItem(key)) saveToStorage(key, data);
  };

  init("app_users", initialMockUsers);
  init("app_assets", mockAssets);
  init("app_requests", initialMockRequests);
  init("app_handovers", mockHandovers);
  init("app_dismantles", mockDismantles);
  init("app_customers", mockCustomers);
  init("app_divisions", mockDivisions);
  init("app_assetCategories", initialAssetCategories);
  init("app_notifications", mockNotifications);
  init("app_loanRequests", mockLoanRequests);
  init("app_maintenances", mockMaintenances);
  init("app_installations", mockInstallations);
  init("app_returns", mockReturns);
  init("app_stockMovements", mockStockMovements);
};

// Initialize mock data on module load
initializeMockData();

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
   * For mock mode: reads from localStorage
   * For real mode: parallel API calls to backend
   */
  fetchAllData: async (): Promise<UnifiedAppData> => {
    if (USE_MOCK) {
      return mockDelay(() => ({
        assets: getFromStorage<Asset[]>("app_assets") || [],
        requests: getFromStorage<Request[]>("app_requests") || [],
        handovers: getFromStorage<Handover[]>("app_handovers") || [],
        dismantles: getFromStorage<Dismantle[]>("app_dismantles") || [],
        customers: getFromStorage<Customer[]>("app_customers") || [],
        users: getFromStorage<User[]>("app_users") || [],
        divisions: getFromStorage<Division[]>("app_divisions") || [],
        categories:
          getFromStorage<AssetCategory[]>("app_assetCategories") || [],
        notifications:
          getFromStorage<Notification[]>("app_notifications") || [],
        loanRequests: getFromStorage<LoanRequest[]>("app_loanRequests") || [],
        maintenances: getFromStorage<Maintenance[]>("app_maintenances") || [],
        installations:
          getFromStorage<Installation[]>("app_installations") || [],
        returns: getFromStorage<AssetReturn[]>("app_returns") || [],
        stockMovements:
          getFromStorage<StockMovement[]>("app_stockMovements") || [],
      }));
    }

    // Real API: Parallel fetch for performance
    try {
      const [
        assets,
        requests,
        users,
        divisions,
        categories,
        customers,
        loanRequests,
        handovers,
        installations,
        maintenances,
        dismantles,
        notifications,
      ] = await Promise.all([
        apiClient.get<Asset[]>("/assets").catch(() => []),
        apiClient.get<Request[]>("/requests").catch(() => []),
        apiClient.get<User[]>("/users").catch(() => []),
        apiClient.get<Division[]>("/divisions").catch(() => []),
        apiClient.get<AssetCategory[]>("/categories").catch(() => []),
        apiClient.get<Customer[]>("/customers").catch(() => []),
        apiClient.get<LoanRequest[]>("/loan-requests").catch(() => []),
        apiClient.get<Handover[]>("/transactions/handovers").catch(() => []),
        apiClient
          .get<Installation[]>("/transactions/installations")
          .catch(() => []),
        apiClient
          .get<Maintenance[]>("/transactions/maintenances")
          .catch(() => []),
        apiClient.get<Dismantle[]>("/transactions/dismantles").catch(() => []),
        apiClient.get<Notification[]>("/notifications").catch(() => []),
      ]);

      return {
        assets: assets || [],
        requests: requests || [],
        handovers: handovers || [],
        dismantles: dismantles || [],
        customers: customers || [],
        users: users || [],
        divisions: divisions || [],
        categories: categories || [],
        notifications: notifications || [],
        loanRequests: loanRequests || [],
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
   * Refresh specific data domain
   */
  refreshAssets: async (): Promise<Asset[]> => {
    if (USE_MOCK) {
      return mockDelay(() => getFromStorage<Asset[]>("app_assets") || []);
    }
    return apiClient.get<Asset[]>("/assets");
  },

  refreshRequests: async (): Promise<Request[]> => {
    if (USE_MOCK) {
      return mockDelay(() => getFromStorage<Request[]>("app_requests") || []);
    }
    return apiClient.get<Request[]>("/requests");
  },

  refreshLoanRequests: async (): Promise<LoanRequest[]> => {
    if (USE_MOCK) {
      return mockDelay(
        () => getFromStorage<LoanRequest[]>("app_loanRequests") || [],
      );
    }
    return apiClient.get<LoanRequest[]>("/loan-requests");
  },

  refreshUsers: async (): Promise<User[]> => {
    if (USE_MOCK) {
      return mockDelay(() => getFromStorage<User[]>("app_users") || []);
    }
    return apiClient.get<User[]>("/users");
  },

  refreshCustomers: async (): Promise<Customer[]> => {
    if (USE_MOCK) {
      return mockDelay(() => getFromStorage<Customer[]>("app_customers") || []);
    }
    return apiClient.get<Customer[]>("/customers");
  },

  refreshCategories: async (): Promise<AssetCategory[]> => {
    if (USE_MOCK) {
      return mockDelay(
        () => getFromStorage<AssetCategory[]>("app_assetCategories") || [],
      );
    }
    return apiClient.get<AssetCategory[]>("/categories");
  },

  refreshNotifications: async (): Promise<Notification[]> => {
    if (USE_MOCK) {
      return mockDelay(
        () => getFromStorage<Notification[]>("app_notifications") || [],
      );
    }
    return apiClient.get<Notification[]>("/notifications");
  },

  refreshTransactions: async () => {
    if (USE_MOCK) {
      return mockDelay(() => ({
        handovers: getFromStorage<Handover[]>("app_handovers") || [],
        installations:
          getFromStorage<Installation[]>("app_installations") || [],
        maintenances: getFromStorage<Maintenance[]>("app_maintenances") || [],
        dismantles: getFromStorage<Dismantle[]>("app_dismantles") || [],
      }));
    }

    const [handovers, installations, maintenances, dismantles] =
      await Promise.all([
        apiClient.get<Handover[]>("/transactions/handovers").catch(() => []),
        apiClient
          .get<Installation[]>("/transactions/installations")
          .catch(() => []),
        apiClient
          .get<Maintenance[]>("/transactions/maintenances")
          .catch(() => []),
        apiClient.get<Dismantle[]>("/transactions/dismantles").catch(() => []),
      ]);

    return { handovers, installations, maintenances, dismantles };
  },
};

// --- MOCK STORAGE UTILITIES (for legacy support) ---
export const mockStorage = {
  get: getFromStorage,
  save: saveToStorage,
  USE_MOCK,
};
