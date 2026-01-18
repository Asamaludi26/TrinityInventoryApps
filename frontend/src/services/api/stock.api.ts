/**
 * Stock API Service
 * Handles: Stock movements, ledger, and stock management
 *
 * Pure API implementation - no mock logic
 * Note: Stock functionality is part of Assets controller in backend
 */

import { apiClient } from "./client";
import type { StockMovement, MovementType } from "../../types";

// --- Type Mapping Utilities ---

// Backend MovementType -> Frontend MovementType
type BackendMovementType =
  | "IN_PURCHASE"
  | "IN_TRANSFER"
  | "IN_RETURN"
  | "IN_DISMANTLE"
  | "OUT_INSTALLATION"
  | "OUT_HANDOVER"
  | "OUT_DISPOSAL"
  | "OUT_MAINTENANCE"
  | "ADJUSTMENT";

const fromBackendMovementType = (type: BackendMovementType): MovementType => {
  const map: Record<BackendMovementType, MovementType> = {
    IN_PURCHASE: "IN_PURCHASE",
    IN_TRANSFER: "IN_PURCHASE", // Map to closest frontend type
    IN_RETURN: "IN_RETURN",
    IN_DISMANTLE: "IN_RETURN",
    OUT_INSTALLATION: "OUT_INSTALLATION",
    OUT_HANDOVER: "OUT_HANDOVER",
    OUT_DISPOSAL: "OUT_BROKEN",
    OUT_MAINTENANCE: "OUT_USAGE_CUSTODY",
    ADJUSTMENT: "OUT_ADJUSTMENT",
  };
  return map[type] || "OUT_ADJUSTMENT";
};

const toBackendMovementType = (type: MovementType): BackendMovementType => {
  const map: Record<MovementType, BackendMovementType> = {
    IN_PURCHASE: "IN_PURCHASE",
    IN_RETURN: "IN_RETURN",
    OUT_INSTALLATION: "OUT_INSTALLATION",
    OUT_HANDOVER: "OUT_HANDOVER",
    OUT_BROKEN: "OUT_DISPOSAL",
    OUT_ADJUSTMENT: "ADJUSTMENT",
    OUT_USAGE_CUSTODY: "OUT_MAINTENANCE",
  };
  return map[type] || "ADJUSTMENT";
};

// Transform backend stock movement to frontend
const transformStockMovement = (data: any): StockMovement => ({
  ...data,
  type: data.type ? fromBackendMovementType(data.type) : undefined,
});

export interface StockMovementFilter {
  assetName?: string;
  brand?: string;
  type?: MovementType;
  startDate?: string;
  endDate?: string;
}

export interface StockLedgerItem {
  assetName: string;
  brand: string;
  unit: string;
  currentBalance: number;
  lastMovementDate: string;
}

export interface StockSummaryItem {
  name: string;
  brand: string;
  totalQuantity: number;
  inStorage: number;
  inUse: number;
  damaged: number;
}

export const stockApi = {
  /**
   * Get all stock movements
   * Note: This endpoint may need to be added to backend if not exists
   */
  getMovements: async (
    filters?: StockMovementFilter,
  ): Promise<StockMovement[]> => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.assetName) params.append("assetName", filters.assetName);
      if (filters.brand) params.append("brand", filters.brand);
      if (filters.type)
        params.append("type", toBackendMovementType(filters.type));
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
    }
    const query = params.toString();
    const data = await apiClient.get<any[]>(
      `/assets/stock-movements${query ? `?${query}` : ""}`,
    );
    return data.map(transformStockMovement);
  },

  /**
   * Get stock ledger (current balances)
   * Uses stock-summary endpoint from assets controller
   */
  getLedger: async (): Promise<StockLedgerItem[]> => {
    const data = await apiClient.get<StockSummaryItem[]>(
      "/assets/stock-summary",
    );
    // Transform stock summary to ledger format
    return data.map((item) => ({
      assetName: item.name,
      brand: item.brand,
      unit: "pcs",
      currentBalance: item.totalQuantity,
      lastMovementDate: new Date().toISOString(),
    }));
  },

  /**
   * Get stock summary grouped by name and brand
   */
  getStockSummary: async (): Promise<StockSummaryItem[]> => {
    return apiClient.get<StockSummaryItem[]>("/assets/stock-summary");
  },

  /**
   * Record a new stock movement (consume stock)
   */
  recordMovement: async (
    data: Omit<StockMovement, "id" | "balanceAfter">,
  ): Promise<StockMovement> => {
    const payload = {
      ...data,
      type: data.type
        ? toBackendMovementType(data.type as MovementType)
        : undefined,
    };
    const result = await apiClient.post<any>("/assets/consume", payload);
    return transformStockMovement(result);
  },

  /**
   * Consume stock (for installation/maintenance)
   */
  consumeStock: async (data: {
    items: Array<{
      assetName: string;
      brand: string;
      quantity: number;
    }>;
    reason: string;
    referenceType?: string;
    referenceId?: string;
  }): Promise<any> => {
    return apiClient.post("/assets/consume", data);
  },

  /**
   * Get stock history for specific item
   * Uses assets endpoint with filters
   */
  getItemHistory: async (
    assetName: string,
    brand: string,
  ): Promise<StockMovement[]> => {
    const params = new URLSearchParams({
      assetName: assetName,
      brand: brand,
    });
    const data = await apiClient.get<any[]>(
      `/assets/stock-movements?${params.toString()}`,
    );
    return data.map(transformStockMovement);
  },

  /**
   * Check stock availability
   */
  checkAvailability: async (
    assetName: string,
    brand: string,
    quantity: number,
  ): Promise<{
    available: boolean;
    currentBalance: number;
    requested: number;
  }> => {
    const params = new URLSearchParams({
      name: assetName,
      brand: brand,
      quantity: quantity.toString(),
    });
    return apiClient.get(`/assets/check-availability?${params.toString()}`);
  },
};
