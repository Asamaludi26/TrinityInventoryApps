/**
 * Global Data Context
 *
 * Centralizes initial data loading to prevent redundant fetches.
 * This context loads all application data once and distributes to stores.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { unifiedApi, UnifiedAppData } from "../services/api";

// Store imports for hydration
import { useAssetStore } from "../stores/useAssetStore";
import { useRequestStore } from "../stores/useRequestStore";
import { useTransactionStore } from "../stores/useTransactionStore";
import { useMasterDataStore } from "../stores/useMasterDataStore";
import { useNotificationStore } from "../stores/useNotificationStore";
import { useAuthStore } from "../stores/useAuthStore";

interface GlobalDataContextType {
  isLoading: boolean;
  isHydrated: boolean;
  error: Error | null;
  refreshAll: () => Promise<void>;
  refreshAssets: () => Promise<void>;
  refreshRequests: () => Promise<void>;
  refreshMasterData: () => Promise<void>;
}

const GlobalDataContext = createContext<GlobalDataContextType | null>(null);

export function GlobalDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isLoadingRef = useRef(false);
  const currentUser = useAuthStore((s) => s.currentUser);

  // Hydrate all stores with fetched data
  const hydrateStores = useCallback((data: UnifiedAppData) => {
    // Asset store hydration
    useAssetStore.setState({
      assets: data.assets,
      categories: data.categories,
      stockMovements: data.stockMovements,
      isLoading: false,
    });

    // Request store hydration
    useRequestStore.setState({
      requests: data.requests,
      loanRequests: data.loanRequests,
      returns: data.returns,
      isLoading: false,
    });

    // Transaction store hydration
    useTransactionStore.setState({
      handovers: data.handovers,
      installations: data.installations,
      maintenances: data.maintenances,
      dismantles: data.dismantles,
      isLoading: false,
    });

    // Master data store hydration
    useMasterDataStore.setState({
      users: data.users,
      divisions: data.divisions,
      customers: data.customers,
      isLoading: false,
    });

    // Notification store hydration
    useNotificationStore.setState({
      notifications: data.notifications,
      isLoading: false,
    });

    console.log("[GlobalData] Stores hydrated successfully");
  }, []);

  // Load all data
  const loadAllData = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    setIsLoading(true);
    setError(null);

    try {
      const data = await unifiedApi.fetchAllData();
      hydrateStores(data);
      setIsHydrated(true);
    } catch (err) {
      console.error("[GlobalData] Failed to load data:", err);
      setError(err instanceof Error ? err : new Error("Data loading failed"));
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [hydrateStores]);

  // Refresh functions for specific domains
  const refreshAll = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  const refreshAssets = useCallback(async () => {
    try {
      const assets = await unifiedApi.refreshAssets();
      useAssetStore.setState({ assets });
    } catch (err) {
      console.error("[GlobalData] Failed to refresh assets:", err);
    }
  }, []);

  const refreshRequests = useCallback(async () => {
    try {
      const [requests, loanRequests] = await Promise.all([
        unifiedApi.refreshRequests(),
        unifiedApi.refreshLoanRequests(),
      ]);
      useRequestStore.setState({ requests, loanRequests });
    } catch (err) {
      console.error("[GlobalData] Failed to refresh requests:", err);
    }
  }, []);

  const refreshMasterData = useCallback(async () => {
    try {
      const [users, customers, categories] = await Promise.all([
        unifiedApi.refreshUsers(),
        unifiedApi.refreshCustomers(),
        unifiedApi.refreshCategories(),
      ]);
      useMasterDataStore.setState({ users, customers });
      useAssetStore.setState({ categories });
    } catch (err) {
      console.error("[GlobalData] Failed to refresh master data:", err);
    }
  }, []);

  // Initial load when user is authenticated
  useEffect(() => {
    if (currentUser && !isHydrated && !isLoadingRef.current) {
      loadAllData();
    }
  }, [currentUser, isHydrated, loadAllData]);

  const contextValue: GlobalDataContextType = {
    isLoading,
    isHydrated,
    error,
    refreshAll,
    refreshAssets,
    refreshRequests,
    refreshMasterData,
  };

  return (
    <GlobalDataContext.Provider value={contextValue}>
      {children}
    </GlobalDataContext.Provider>
  );
}

export function useGlobalData() {
  const context = useContext(GlobalDataContext);
  if (!context) {
    throw new Error("useGlobalData must be used within GlobalDataProvider");
  }
  return context;
}

// Optional: Hook for checking loading state
export function useIsDataLoading() {
  const context = useContext(GlobalDataContext);
  return context?.isLoading ?? true;
}
