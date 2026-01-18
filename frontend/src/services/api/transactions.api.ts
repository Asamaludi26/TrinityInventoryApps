/**
 * Transactions API Service
 * Handles: Handovers, Installations, Maintenances, Dismantles
 *
 * Pure API implementation - no mock logic
 */

import { apiClient } from "./client";
import {
  Handover,
  Installation,
  Maintenance,
  Dismantle,
  ItemStatus,
} from "../../types";

// --- Type Mapping Utilities ---

// Backend DismantleStatus/MaintenanceStatus -> Frontend ItemStatus
type BackendTransactionStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

const fromBackendTransactionStatus = (
  status: BackendTransactionStatus,
): ItemStatus => {
  const map: Record<BackendTransactionStatus, ItemStatus> = {
    PENDING: ItemStatus.PENDING,
    IN_PROGRESS: ItemStatus.IN_PROGRESS,
    COMPLETED: ItemStatus.COMPLETED,
    CANCELLED: ItemStatus.CANCELLED,
  };
  return map[status] || ItemStatus.PENDING;
};

const toBackendTransactionStatus = (
  status: ItemStatus,
): BackendTransactionStatus => {
  // Only map the statuses relevant to transactions
  switch (status) {
    case ItemStatus.PENDING:
      return "PENDING";
    case ItemStatus.APPROVED:
    case ItemStatus.LOGISTIC_APPROVED:
    case ItemStatus.IN_PROGRESS:
      return "IN_PROGRESS";
    case ItemStatus.COMPLETED:
      return "COMPLETED";
    case ItemStatus.REJECTED:
    case ItemStatus.CANCELLED:
      return "CANCELLED";
    default:
      return "PENDING";
  }
};

// Transform backend handover to frontend
const transformHandover = (data: any): Handover => ({
  ...data,
  // Map any status fields if present
});

// Transform backend installation to frontend
const transformInstallation = (data: any): Installation => ({
  ...data,
});

// Transform backend maintenance to frontend
const transformMaintenance = (data: any): Maintenance => ({
  ...data,
  status: data.status ? fromBackendTransactionStatus(data.status) : undefined,
});

// Transform backend dismantle to frontend
const transformDismantle = (data: any): Dismantle => ({
  ...data,
  status: data.status ? fromBackendTransactionStatus(data.status) : undefined,
});

// --- HANDOVERS ---
export const handoversApi = {
  getAll: async (): Promise<Handover[]> => {
    const data = await apiClient.get<any[]>("/transactions/handovers");
    return data.map(transformHandover);
  },

  getById: async (id: string): Promise<Handover | null> => {
    try {
      const data = await apiClient.get<any>(`/transactions/handovers/${id}`);
      return transformHandover(data);
    } catch {
      return null;
    }
  },

  create: async (
    data: Omit<Handover, "id" | "docNumber">,
  ): Promise<Handover> => {
    const result = await apiClient.post<any>("/transactions/handovers", data);
    return transformHandover(result);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/transactions/handovers/${id}`);
  },
};

// --- INSTALLATIONS ---
export const installationsApi = {
  getAll: async (customerId?: string): Promise<Installation[]> => {
    const params = customerId ? `?customerId=${customerId}` : "";
    const data = await apiClient.get<any[]>(
      `/transactions/installations${params}`,
    );
    return data.map(transformInstallation);
  },

  getById: async (id: string): Promise<Installation | null> => {
    try {
      const data = await apiClient.get<any>(
        `/transactions/installations/${id}`,
      );
      return transformInstallation(data);
    } catch {
      return null;
    }
  },

  create: async (
    data: Omit<Installation, "id" | "docNumber">,
  ): Promise<Installation> => {
    const result = await apiClient.post<any>(
      "/transactions/installations",
      data,
    );
    return transformInstallation(result);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/transactions/installations/${id}`);
  },
};

// --- MAINTENANCES ---
export const maintenancesApi = {
  getAll: async (filters?: {
    status?: ItemStatus;
    assetId?: string;
  }): Promise<Maintenance[]> => {
    const params = new URLSearchParams();
    if (filters?.status) {
      params.append("status", toBackendTransactionStatus(filters.status));
    }
    if (filters?.assetId) {
      params.append("assetId", filters.assetId);
    }
    const queryString = params.toString();
    const url = `/transactions/maintenances${queryString ? `?${queryString}` : ""}`;
    const data = await apiClient.get<any[]>(url);
    return data.map(transformMaintenance);
  },

  getById: async (id: string): Promise<Maintenance | null> => {
    try {
      const data = await apiClient.get<any>(`/transactions/maintenances/${id}`);
      return transformMaintenance(data);
    } catch {
      return null;
    }
  },

  create: async (
    data: Omit<Maintenance, "id" | "docNumber">,
  ): Promise<Maintenance> => {
    const result = await apiClient.post<any>(
      "/transactions/maintenances",
      data,
    );
    return transformMaintenance(result);
  },

  update: async (
    id: string,
    data: Partial<Maintenance>,
  ): Promise<Maintenance> => {
    const result = await apiClient.patch<any>(
      `/transactions/maintenances/${id}`,
      data,
    );
    return transformMaintenance(result);
  },

  complete: async (
    id: string,
    payload: {
      actionTaken?: string;
      laborCost?: number;
      partsCost?: number;
      completedBy?: string;
      completionDate?: string;
    },
  ): Promise<Maintenance> => {
    const result = await apiClient.patch<any>(
      `/transactions/maintenances/${id}/complete`,
      payload,
    );
    return transformMaintenance(result);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/transactions/maintenances/${id}`);
  },
};

// --- DISMANTLES ---
export const dismantlesApi = {
  getAll: async (status?: ItemStatus): Promise<Dismantle[]> => {
    const params = status
      ? `?status=${toBackendTransactionStatus(status)}`
      : "";
    const data = await apiClient.get<any[]>(
      `/transactions/dismantles${params}`,
    );
    return data.map(transformDismantle);
  },

  getById: async (id: string): Promise<Dismantle | null> => {
    try {
      const data = await apiClient.get<any>(`/transactions/dismantles/${id}`);
      return transformDismantle(data);
    } catch {
      return null;
    }
  },

  create: async (
    data: Omit<Dismantle, "id" | "docNumber">,
  ): Promise<Dismantle> => {
    const result = await apiClient.post<any>("/transactions/dismantles", data);
    return transformDismantle(result);
  },

  update: async (id: string, data: Partial<Dismantle>): Promise<Dismantle> => {
    const result = await apiClient.patch<any>(
      `/transactions/dismantles/${id}`,
      data,
    );
    return transformDismantle(result);
  },

  complete: async (
    id: string,
    payload: { acknowledger: string },
  ): Promise<Dismantle> => {
    const result = await apiClient.patch<any>(
      `/transactions/dismantles/${id}/complete`,
      payload,
    );
    return transformDismantle(result);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/transactions/dismantles/${id}`);
  },
};
