/**
 * Transactions API Service
 * Handles: Handovers, Installations, Maintenances, Dismantles
 */

import { apiClient, USE_MOCK, ApiError } from "./client";
import {
  Handover,
  Installation,
  Maintenance,
  Dismantle,
  ItemStatus,
  AssetStatus,
  AssetCondition,
} from "../../types";
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

// --- HANDOVERS ---
export const handoversApi = {
  getAll: async (): Promise<Handover[]> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        return getFromStorage<Handover[]>("app_handovers") || [];
      });
    }
    return apiClient.get<Handover[]>("/transactions/handovers");
  },

  getById: async (id: string): Promise<Handover | null> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const handovers = getFromStorage<Handover[]>("app_handovers") || [];
        return handovers.find((h) => h.id === id) || null;
      });
    }
    return apiClient.get<Handover>(`/transactions/handovers/${id}`);
  },

  create: async (
    data: Omit<Handover, "id" | "docNumber">,
  ): Promise<Handover> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const handovers = getFromStorage<Handover[]>("app_handovers") || [];
        const assets = getFromStorage<any[]>("app_assets") || [];

        const docsForGenerator = handovers.map((h) => ({
          docNumber: h.docNumber,
        }));
        const docNumber = generateDocumentNumber(
          "HO",
          docsForGenerator,
          new Date(data.handoverDate),
        );

        const newHandover: Handover = {
          ...data,
          id: `handover_${Date.now()}`,
          docNumber,
        };

        // Update asset ownership
        const assetIds = data.items
          .filter((i) => i.assetId)
          .map((i) => i.assetId!);
        const updatedAssets = assets.map((a) => {
          if (assetIds.includes(a.id)) {
            return {
              ...a,
              currentUser: data.penerima,
              location: `Dipegang: ${data.penerima}`,
              status: AssetStatus.IN_CUSTODY,
            };
          }
          return a;
        });
        saveToStorage("app_assets", updatedAssets);

        const updated = [newHandover, ...handovers];
        saveToStorage("app_handovers", updated);
        return newHandover;
      });
    }
    return apiClient.post<Handover>("/transactions/handovers", data);
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const handovers = getFromStorage<Handover[]>("app_handovers") || [];
        const updated = handovers.filter((h) => h.id !== id);
        saveToStorage("app_handovers", updated);
      });
    }
    return apiClient.delete(`/transactions/handovers/${id}`);
  },
};

// --- INSTALLATIONS ---
export const installationsApi = {
  getAll: async (): Promise<Installation[]> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        return getFromStorage<Installation[]>("app_installations") || [];
      });
    }
    return apiClient.get<Installation[]>("/transactions/installations");
  },

  getById: async (id: string): Promise<Installation | null> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const installations =
          getFromStorage<Installation[]>("app_installations") || [];
        return installations.find((i) => i.id === id) || null;
      });
    }
    return apiClient.get<Installation>(`/transactions/installations/${id}`);
  },

  create: async (
    data: Omit<Installation, "id" | "docNumber">,
  ): Promise<Installation> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const installations =
          getFromStorage<Installation[]>("app_installations") || [];
        const assets = getFromStorage<any[]>("app_assets") || [];

        const docsForGenerator = installations.map((i) => ({
          docNumber: i.docNumber,
        }));
        const docNumber = generateDocumentNumber(
          "INS",
          docsForGenerator,
          new Date(data.installationDate),
        );

        const newInstallation: Installation = {
          ...data,
          id: `installation_${Date.now()}`,
          docNumber,
        };

        // Update installed assets
        const assetIds = data.assetsInstalled.map((a) => a.assetId);
        const updatedAssets = assets.map((a) => {
          if (assetIds.includes(a.id)) {
            return {
              ...a,
              status: AssetStatus.IN_USE,
              currentUser: data.customerId,
              location: `Terpasang: ${data.customerName}`,
            };
          }
          return a;
        });
        saveToStorage("app_assets", updatedAssets);

        const updated = [newInstallation, ...installations];
        saveToStorage("app_installations", updated);
        return newInstallation;
      });
    }
    return apiClient.post<Installation>("/transactions/installations", data);
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const installations =
          getFromStorage<Installation[]>("app_installations") || [];
        const updated = installations.filter((i) => i.id !== id);
        saveToStorage("app_installations", updated);
      });
    }
    return apiClient.delete(`/transactions/installations/${id}`);
  },
};

// --- MAINTENANCES ---
export const maintenancesApi = {
  getAll: async (): Promise<Maintenance[]> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        return getFromStorage<Maintenance[]>("app_maintenances") || [];
      });
    }
    return apiClient.get<Maintenance[]>("/transactions/maintenances");
  },

  getById: async (id: string): Promise<Maintenance | null> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const maintenances =
          getFromStorage<Maintenance[]>("app_maintenances") || [];
        return maintenances.find((m) => m.id === id) || null;
      });
    }
    return apiClient.get<Maintenance>(`/transactions/maintenances/${id}`);
  },

  create: async (
    data: Omit<Maintenance, "id" | "docNumber">,
  ): Promise<Maintenance> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const maintenances =
          getFromStorage<Maintenance[]>("app_maintenances") || [];

        const docsForGenerator = maintenances.map((m) => ({
          docNumber: m.docNumber,
        }));
        const docNumber = generateDocumentNumber(
          "MNT",
          docsForGenerator,
          new Date(data.maintenanceDate),
        );

        const newMaintenance: Maintenance = {
          ...data,
          id: `maintenance_${Date.now()}`,
          docNumber,
        };

        const updated = [newMaintenance, ...maintenances];
        saveToStorage("app_maintenances", updated);
        return newMaintenance;
      });
    }
    return apiClient.post<Maintenance>("/transactions/maintenances", data);
  },

  update: async (
    id: string,
    data: Partial<Maintenance>,
  ): Promise<Maintenance> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const maintenances =
          getFromStorage<Maintenance[]>("app_maintenances") || [];
        const index = maintenances.findIndex((m) => m.id === id);
        if (index === -1)
          throw new ApiError("Maintenance tidak ditemukan.", 404);

        const updated = { ...maintenances[index], ...data };
        maintenances[index] = updated;
        saveToStorage("app_maintenances", maintenances);
        return updated;
      });
    }
    return apiClient.patch<Maintenance>(
      `/transactions/maintenances/${id}`,
      data,
    );
  },

  complete: async (
    id: string,
    payload: { completedBy: string; completionDate: string },
  ): Promise<Maintenance> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const maintenances =
          getFromStorage<Maintenance[]>("app_maintenances") || [];
        const index = maintenances.findIndex((m) => m.id === id);
        if (index === -1)
          throw new ApiError("Maintenance tidak ditemukan.", 404);

        const updated: Maintenance = {
          ...maintenances[index],
          ...payload,
          status: ItemStatus.COMPLETED,
        };
        maintenances[index] = updated;
        saveToStorage("app_maintenances", maintenances);
        return updated;
      });
    }
    return apiClient.patch<Maintenance>(
      `/transactions/maintenances/${id}/complete`,
      payload,
    );
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const maintenances =
          getFromStorage<Maintenance[]>("app_maintenances") || [];
        const updated = maintenances.filter((m) => m.id !== id);
        saveToStorage("app_maintenances", updated);
      });
    }
    return apiClient.delete(`/transactions/maintenances/${id}`);
  },
};

// --- DISMANTLES ---
export const dismantlesApi = {
  getAll: async (): Promise<Dismantle[]> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        return getFromStorage<Dismantle[]>("app_dismantles") || [];
      });
    }
    return apiClient.get<Dismantle[]>("/transactions/dismantles");
  },

  getById: async (id: string): Promise<Dismantle | null> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const dismantles = getFromStorage<Dismantle[]>("app_dismantles") || [];
        return dismantles.find((d) => d.id === id) || null;
      });
    }
    return apiClient.get<Dismantle>(`/transactions/dismantles/${id}`);
  },

  create: async (
    data: Omit<Dismantle, "id" | "docNumber">,
  ): Promise<Dismantle> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const dismantles = getFromStorage<Dismantle[]>("app_dismantles") || [];

        const docsForGenerator = dismantles.map((d) => ({
          docNumber: d.docNumber,
        }));
        const docNumber = generateDocumentNumber(
          "DSM",
          docsForGenerator,
          new Date(data.dismantleDate),
        );

        const newDismantle: Dismantle = {
          ...data,
          id: `dismantle_${Date.now()}`,
          docNumber,
          status: ItemStatus.PENDING,
        };

        const updated = [newDismantle, ...dismantles];
        saveToStorage("app_dismantles", updated);
        return newDismantle;
      });
    }
    return apiClient.post<Dismantle>("/transactions/dismantles", data);
  },

  update: async (id: string, data: Partial<Dismantle>): Promise<Dismantle> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const dismantles = getFromStorage<Dismantle[]>("app_dismantles") || [];
        const index = dismantles.findIndex((d) => d.id === id);
        if (index === -1) throw new ApiError("Dismantle tidak ditemukan.", 404);

        const updated = { ...dismantles[index], ...data };
        dismantles[index] = updated;
        saveToStorage("app_dismantles", dismantles);
        return updated;
      });
    }
    return apiClient.patch<Dismantle>(`/transactions/dismantles/${id}`, data);
  },

  complete: async (
    id: string,
    payload: { acknowledger: string },
  ): Promise<Dismantle> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const dismantles = getFromStorage<Dismantle[]>("app_dismantles") || [];
        const assets = getFromStorage<any[]>("app_assets") || [];

        const index = dismantles.findIndex((d) => d.id === id);
        if (index === -1) throw new ApiError("Dismantle tidak ditemukan.", 404);

        const dismantle = dismantles[index];

        // Update dismantle
        const updated: Dismantle = {
          ...dismantle,
          acknowledger: payload.acknowledger,
          status: ItemStatus.COMPLETED,
        };
        dismantles[index] = updated;
        saveToStorage("app_dismantles", dismantles);

        // Return asset to storage
        const isGood = [
          AssetCondition.GOOD,
          AssetCondition.USED_OKAY,
          AssetCondition.BRAND_NEW,
        ].includes(dismantle.retrievedCondition);

        const updatedAssets = assets.map((a) => {
          if (a.id === dismantle.assetId) {
            return {
              ...a,
              status: isGood ? AssetStatus.IN_STORAGE : AssetStatus.DAMAGED,
              condition: dismantle.retrievedCondition,
              currentUser: null,
              location: isGood ? "Gudang Inventori" : "Gudang (Rusak)",
              isDismantled: true,
              dismantleInfo: {
                customerId: dismantle.customerId,
                customerName: dismantle.customerName,
                dismantleDate: dismantle.dismantleDate,
                dismantleId: dismantle.id,
              },
            };
          }
          return a;
        });
        saveToStorage("app_assets", updatedAssets);

        return updated;
      });
    }
    return apiClient.patch<Dismantle>(
      `/transactions/dismantles/${id}/complete`,
      payload,
    );
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const dismantles = getFromStorage<Dismantle[]>("app_dismantles") || [];
        const updated = dismantles.filter((d) => d.id !== id);
        saveToStorage("app_dismantles", updated);
      });
    }
    return apiClient.delete(`/transactions/dismantles/${id}`);
  },
};
