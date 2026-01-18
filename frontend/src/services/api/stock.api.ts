/**
 * Stock API Service
 * Handles: Stock movements, ledger, and stock management
 */

import { apiClient, USE_MOCK, ApiError } from "./client";
import { StockMovement, MovementType } from "../../types";
import { generateDocumentNumber } from "../../utils/documentNumberGenerator";

// Mock helpers
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

const MOCK_LATENCY = 300;
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

export const stockApi = {
  /**
   * Get all stock movements
   */
  getMovements: async (
    filters?: StockMovementFilter,
  ): Promise<StockMovement[]> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        let movements =
          getFromStorage<StockMovement[]>("app_stockMovements") || [];

        if (filters) {
          if (filters.assetName) {
            movements = movements.filter((m) =>
              m.assetName
                .toLowerCase()
                .includes(filters.assetName!.toLowerCase()),
            );
          }
          if (filters.brand) {
            movements = movements.filter((m) =>
              m.brand.toLowerCase().includes(filters.brand!.toLowerCase()),
            );
          }
          if (filters.type) {
            movements = movements.filter((m) => m.type === filters.type);
          }
          if (filters.startDate) {
            movements = movements.filter(
              (m) => new Date(m.date) >= new Date(filters.startDate!),
            );
          }
          if (filters.endDate) {
            movements = movements.filter(
              (m) => new Date(m.date) <= new Date(filters.endDate!),
            );
          }
        }

        return movements.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
      });
    }

    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }
    const query = params.toString();
    return apiClient.get<StockMovement[]>(
      `/stock/movements${query ? `?${query}` : ""}`,
    );
  },

  /**
   * Get stock ledger (current balances)
   */
  getLedger: async (): Promise<StockLedgerItem[]> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const movements =
          getFromStorage<StockMovement[]>("app_stockMovements") || [];
        const ledger: Record<string, StockLedgerItem> = {};

        movements.forEach((m) => {
          const key = `${m.assetName}|${m.brand}`;
          if (!ledger[key]) {
            ledger[key] = {
              assetName: m.assetName,
              brand: m.brand,
              unit: "pcs", // Default unit - actual unit from asset type
              currentBalance: 0,
              lastMovementDate: m.date,
            };
          }

          // Update balance
          if (m.type.startsWith("IN_")) {
            ledger[key].currentBalance += m.quantity;
          } else {
            ledger[key].currentBalance -= m.quantity;
          }

          // Update last movement date
          if (new Date(m.date) > new Date(ledger[key].lastMovementDate)) {
            ledger[key].lastMovementDate = m.date;
          }
        });

        return Object.values(ledger);
      });
    }

    return apiClient.get<StockLedgerItem[]>("/stock/ledger");
  },

  /**
   * Record a new stock movement
   */
  recordMovement: async (
    data: Omit<StockMovement, "id" | "balanceAfter">,
  ): Promise<StockMovement> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const allMovements =
          getFromStorage<StockMovement[]>("app_stockMovements") || [];

        const newMovement: StockMovement = {
          id: `MOV-${Date.now()}`,
          ...data,
          quantity: Math.abs(data.quantity),
          balanceAfter: 0, // Will be recalculated
        };

        // Recalculate ledger balance for this item
        const itemMovements = allMovements.filter(
          (m) => m.assetName === data.assetName && m.brand === data.brand,
        );
        const combined = [...itemMovements, newMovement].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );

        let balance = 0;
        const recalculated = combined.map((m) => {
          if (m.type.startsWith("IN_")) {
            balance += m.quantity;
          } else {
            balance = Math.max(0, balance - m.quantity);
          }
          return { ...m, balanceAfter: balance };
        });

        // Update storage
        const others = allMovements.filter(
          (m) => !(m.assetName === data.assetName && m.brand === data.brand),
        );
        const final = [...others, ...recalculated];
        saveToStorage("app_stockMovements", final);

        return recalculated[recalculated.length - 1];
      });
    }

    return apiClient.post<StockMovement>("/stock/movements", data);
  },

  /**
   * Get stock history for specific item
   */
  getItemHistory: async (
    assetName: string,
    brand: string,
  ): Promise<StockMovement[]> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const movements =
          getFromStorage<StockMovement[]>("app_stockMovements") || [];
        return movements
          .filter((m) => m.assetName === assetName && m.brand === brand)
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );
      });
    }

    return apiClient.get<StockMovement[]>(
      `/stock/history?assetName=${encodeURIComponent(assetName)}&brand=${encodeURIComponent(brand)}`,
    );
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
    if (USE_MOCK) {
      return mockDelay(() => {
        const movements =
          getFromStorage<StockMovement[]>("app_stockMovements") || [];
        const itemMovements = movements.filter(
          (m) => m.assetName === assetName && m.brand === brand,
        );

        let balance = 0;
        itemMovements.forEach((m) => {
          if (m.type.startsWith("IN_")) {
            balance += m.quantity;
          } else {
            balance -= m.quantity;
          }
        });

        return {
          available: balance >= quantity,
          currentBalance: Math.max(0, balance),
          requested: quantity,
        };
      });
    }

    return apiClient.get(
      `/stock/check-availability?assetName=${encodeURIComponent(assetName)}&brand=${encodeURIComponent(brand)}&quantity=${quantity}`,
    );
  },
};
