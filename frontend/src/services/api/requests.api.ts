/**
 * Requests API Service (Purchase Requests)
 * Pure API calls - no mock logic
 */

import { apiClient } from "./client";
import { Request, PurchaseDetails, ItemStatus } from "../../types";
import { transformBackendRequest, toBackendRequestStatus } from "../../utils/enumMapper";

// Helper Type
type BackendDTO = Record<string, unknown>;

export interface RequestFilters {
  status?: string;
  requester?: string;
  division?: string;
  dateFrom?: string;
  dateTo?: string;
  skip?: number;
  take?: number;
}

export interface ApproveRequestPayload {
  approver: string;
  approvalDate: string;
  itemStatuses: Record<
    number,
    {
      status: "approved" | "rejected" | "partial" | "stock_allocated" | "procurement_needed";
      reason?: string;
      approvedQuantity?: number;
    }
  >;
}

export const requestsApi = {
  /**
   * Get all requests
   */
  getAll: async (filters?: RequestFilters): Promise<Request[]> => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.status) {
        params.append("status", toBackendRequestStatus(filters.status as ItemStatus));
      }
      if (filters.requester) params.append("requesterId", filters.requester);
      if (filters.division) params.append("division", filters.division);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);
      if (filters.skip) params.append("skip", String(filters.skip));
      if (filters.take) params.append("take", String(filters.take));
    }
    const query = params.toString();
    const response = await apiClient.get<BackendDTO[]>(`/requests${query ? `?${query}` : ""}`);
    return (response || []).map((item) => transformBackendRequest(item));
  },

  /**
   * Get single request
   */
  getById: async (id: string): Promise<Request | null> => {
    try {
      const response = await apiClient.get<BackendDTO>(`/requests/${id}`);
      return transformBackendRequest(response);
    } catch (error: unknown) {
      // FIX: Cek tipe error secara aman
      if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        (error as Record<string, unknown>).status === 404
      ) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create new request
   */
  create: async (data: Omit<Request, "id" | "docNumber" | "status">): Promise<Request> => {
    const backendData = {
      requestDate: data.requestDate,
      division: data.division,
      orderType:
        data.order?.type === "Urgent"
          ? "URGENT"
          : data.order?.type === "Project Based"
            ? "PROJECT_BASED"
            : "REGULAR_STOCK",
      justification: data.order?.justification,
      project: data.order?.project,
      allocationTarget: data.order?.allocationTarget === "Inventory" ? "INVENTORY" : "USAGE",
      items: data.items.map((item) => ({
        itemName: item.itemName,
        itemTypeBrand: item.itemTypeBrand,
        quantity: item.quantity,
        unit: item.unit,
        reason: item.keterangan,
      })),
    };
    const response = await apiClient.post<BackendDTO>("/requests", backendData);
    return transformBackendRequest(response);
  },

  /**
   * Update request
   */
  update: async (id: string, data: Partial<Request>): Promise<Request> => {
    const response = await apiClient.patch<BackendDTO>(`/requests/${id}`, data);
    return transformBackendRequest(response);
  },

  /**
   * Approve request (logistic approval)
   */
  approve: async (id: string, payload: ApproveRequestPayload): Promise<Request> => {
    const response = await apiClient.post<BackendDTO>(`/requests/${id}/approve`, payload);
    return transformBackendRequest(response);
  },

  /**
   * Reject request
   */
  reject: async (
    id: string,
    payload: {
      reason?: string;
      rejectedBy?: string;
      rejectionReason?: string;
    }
  ): Promise<Request> => {
    // Support both formats
    const reason = payload.reason || payload.rejectionReason || "";
    const response = await apiClient.post<BackendDTO>(`/requests/${id}/reject`, {
      reason,
      rejectedBy: payload.rejectedBy,
    });
    return transformBackendRequest(response);
  },

  /**
   * Mark request as arrived
   */
  markArrived: async (id: string): Promise<Request> => {
    const response = await apiClient.patch<BackendDTO>(`/requests/${id}/arrived`);
    return transformBackendRequest(response);
  },

  /**
   * Complete request
   */
  complete: async (id: string): Promise<Request> => {
    const response = await apiClient.patch<BackendDTO>(`/requests/${id}/complete`);
    return transformBackendRequest(response);
  },

  /**
   * Fill purchase details for item
   */
  fillPurchaseDetails: async (
    id: string,
    itemId: number,
    details: PurchaseDetails
  ): Promise<Request> => {
    const response = await apiClient.patch<BackendDTO>(
      `/requests/${id}/items/${itemId}/purchase`,
      details
    );
    return transformBackendRequest(response);
  },

  /**
   * Delete request
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/requests/${id}`);
  },

  /**
   * Cancel request
   */
  cancel: async (id: string, reason?: string): Promise<Request> => {
    const response = await apiClient.post<BackendDTO>(`/requests/${id}/cancel`, {
      reason,
    });
    return transformBackendRequest(response);
  },

  /**
   * Register assets from completed request
   */
  registerAssets: async (
    id: string,
    assets: Array<{ itemId: number; assetData: Record<string, unknown> }>
  ): Promise<Request> => {
    const response = await apiClient.post<BackendDTO>(`/requests/${id}/register-assets`, {
      assets,
    });
    return transformBackendRequest(response);
  },
};
