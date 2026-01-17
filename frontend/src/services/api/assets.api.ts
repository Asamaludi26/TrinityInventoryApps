/**
 * Assets API Service
 */

import { apiClient, USE_MOCK } from "./client";
import { Asset, AssetStatus, ActivityLogEntry } from "../../types";

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

export interface AssetFilters {
  status?: AssetStatus;
  category?: string;
  location?: string;
  currentUser?: string;
  search?: string;
}

export interface ConsumeContext {
  customerId?: string;
  location?: string;
  docNumber?: string;
  technicianName?: string;
}

export interface ConsumeMaterial {
  materialAssetId?: string;
  itemName: string;
  brand: string;
  quantity: number;
  unit: string;
}

export const assetsApi = {
  /**
   * Get all assets with optional filters
   */
  getAll: async (filters?: AssetFilters): Promise<Asset[]> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        let assets = getFromStorage<Asset[]>("app_assets") || [];

        if (filters) {
          if (filters.status) {
            assets = assets.filter((a) => a.status === filters.status);
          }
          if (filters.category) {
            assets = assets.filter((a) => a.category === filters.category);
          }
          if (filters.location) {
            assets = assets.filter((a) => a.location === filters.location);
          }
          if (filters.currentUser) {
            assets = assets.filter(
              (a) => a.currentUser === filters.currentUser,
            );
          }
          if (filters.search) {
            const q = filters.search.toLowerCase();
            assets = assets.filter(
              (a) =>
                a.name.toLowerCase().includes(q) ||
                a.serialNumber?.toLowerCase().includes(q) ||
                a.brand.toLowerCase().includes(q),
            );
          }
        }

        return assets;
      });
    }

    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const query = params.toString();
    return apiClient.get<Asset[]>(`/assets${query ? `?${query}` : ""}`);
  },

  /**
   * Get single asset by ID
   */
  getById: async (id: string): Promise<Asset | null> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const assets = getFromStorage<Asset[]>("app_assets") || [];
        return assets.find((a) => a.id === id) || null;
      });
    }

    return apiClient.get<Asset>(`/assets/${id}`);
  },

  /**
   * Create new asset
   */
  create: async (data: Omit<Asset, "activityLog">): Promise<Asset> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const assets = getFromStorage<Asset[]>("app_assets") || [];
        const newAsset: Asset = {
          ...data,
          activityLog: [
            {
              id: `log_${Date.now()}`,
              timestamp: new Date().toISOString(),
              user: data.recordedBy,
              action: "CREATED",
              details: "Aset didaftarkan ke sistem.",
            },
          ],
        };
        const updated = [newAsset, ...assets];
        saveToStorage("app_assets", updated);
        return newAsset;
      });
    }

    return apiClient.post<Asset>("/assets", data);
  },

  /**
   * Update asset
   */
  update: async (id: string, data: Partial<Asset>): Promise<Asset> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const assets = getFromStorage<Asset[]>("app_assets") || [];
        const index = assets.findIndex((a) => a.id === id);
        if (index === -1) throw new Error("Asset not found");

        const logEntry: ActivityLogEntry = {
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: data.lastModifiedBy || "System",
          action: "UPDATED",
          details: "Data aset diperbarui.",
        };

        const updated = {
          ...assets[index],
          ...data,
          lastModifiedDate: new Date().toISOString(),
          activityLog: [...(assets[index].activityLog || []), logEntry],
        };
        assets[index] = updated;
        saveToStorage("app_assets", assets);
        return updated;
      });
    }

    return apiClient.patch<Asset>(`/assets/${id}`, data);
  },

  /**
   * Batch update multiple assets
   */
  updateBatch: async (
    ids: string[],
    data: Partial<Asset>,
    referenceId?: string,
  ): Promise<Asset[]> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const assets = getFromStorage<Asset[]>("app_assets") || [];
        const updatedAssets: Asset[] = [];

        const logEntry: ActivityLogEntry = {
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: data.lastModifiedBy || "System",
          action: "BATCH_UPDATED",
          details: `Batch update${referenceId ? ` (Ref: ${referenceId})` : ""}`,
          referenceId,
        };

        const updated = assets.map((a) => {
          if (ids.includes(a.id)) {
            const newAsset = {
              ...a,
              ...data,
              lastModifiedDate: new Date().toISOString(),
              activityLog: [...(a.activityLog || []), logEntry],
            };
            updatedAssets.push(newAsset);
            return newAsset;
          }
          return a;
        });

        saveToStorage("app_assets", updated);
        return updatedAssets;
      });
    }

    return apiClient.patch<Asset[]>("/assets/batch", {
      ids,
      data,
      referenceId,
    });
  },

  /**
   * Delete asset
   */
  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const assets = getFromStorage<Asset[]>("app_assets") || [];
        const updated = assets.filter((a) => a.id !== id);
        saveToStorage("app_assets", updated);
      });
    }

    return apiClient.delete(`/assets/${id}`);
  },

  /**
   * Consume materials (for installation/maintenance)
   */
  consume: async (
    materials: ConsumeMaterial[],
    context: ConsumeContext,
  ): Promise<{ success: boolean; errors: string[] }> => {
    if (USE_MOCK) {
      // This logic is complex - delegate to existing store for now
      // In real implementation, backend handles this atomically
      return mockDelay(() => ({ success: true, errors: [] }));
    }

    return apiClient.post("/assets/consume", { items: materials, context });
  },
};
