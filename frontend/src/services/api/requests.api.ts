/**
 * Requests API Service (Purchase Requests)
 */

import { apiClient, USE_MOCK, ApiError } from "./client";
import { Request, ItemStatus, PurchaseDetails } from "../../types";
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

export interface RequestFilters {
  status?: ItemStatus;
  requester?: string;
  division?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ApproveRequestPayload {
  approver: string;
  approvalDate: string;
  itemStatuses: Record<
    number,
    {
      status:
        | "approved"
        | "rejected"
        | "partial"
        | "stock_allocated"
        | "procurement_needed";
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
    if (USE_MOCK) {
      return mockDelay(() => {
        let requests = getFromStorage<Request[]>("app_requests") || [];

        if (filters) {
          if (filters.status) {
            requests = requests.filter((r) => r.status === filters.status);
          }
          if (filters.requester) {
            requests = requests.filter(
              (r) => r.requester === filters.requester,
            );
          }
          if (filters.division) {
            requests = requests.filter((r) => r.division === filters.division);
          }
        }

        return requests.sort(
          (a, b) =>
            new Date(b.requestDate).getTime() -
            new Date(a.requestDate).getTime(),
        );
      });
    }

    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const query = params.toString();
    return apiClient.get<Request[]>(`/requests${query ? `?${query}` : ""}`);
  },

  /**
   * Get single request
   */
  getById: async (id: string): Promise<Request | null> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const requests = getFromStorage<Request[]>("app_requests") || [];
        return requests.find((r) => r.id === id) || null;
      });
    }

    return apiClient.get<Request>(`/requests/${id}`);
  },

  /**
   * Create new request
   */
  create: async (
    data: Omit<Request, "id" | "docNumber" | "status">,
  ): Promise<Request> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const requests = getFromStorage<Request[]>("app_requests") || [];
        const requestDate = new Date(data.requestDate);
        const docsForGenerator = requests.map((r) => ({ docNumber: r.id }));
        const newId = generateDocumentNumber(
          "RO",
          docsForGenerator,
          requestDate,
        );

        const newRequest: Request = {
          ...data,
          id: newId,
          docNumber: newId,
          status: ItemStatus.PENDING,
          isRegistered: false,
          partiallyRegisteredItems: {},
        };

        const updated = [newRequest, ...requests];
        saveToStorage("app_requests", updated);
        return newRequest;
      });
    }

    return apiClient.post<Request>("/requests", data);
  },

  /**
   * Update request
   */
  update: async (id: string, data: Partial<Request>): Promise<Request> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const requests = getFromStorage<Request[]>("app_requests") || [];
        const index = requests.findIndex((r) => r.id === id);
        if (index === -1) throw new ApiError("Request tidak ditemukan.", 404);

        const updated = { ...requests[index], ...data };
        requests[index] = updated;
        saveToStorage("app_requests", requests);
        return updated;
      });
    }

    return apiClient.patch<Request>(`/requests/${id}`, data);
  },

  /**
   * Approve request (logistic approval)
   */
  approve: async (
    id: string,
    payload: ApproveRequestPayload,
  ): Promise<Request> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const requests = getFromStorage<Request[]>("app_requests") || [];
        const index = requests.findIndex((r) => r.id === id);
        if (index === -1) throw new ApiError("Request tidak ditemukan.", 404);

        const allRejected = Object.values(payload.itemStatuses).every(
          (s) => s.status === "rejected",
        );

        const updated: Request = {
          ...requests[index],
          logisticApprover: payload.approver,
          logisticApprovalDate: payload.approvalDate,
          itemStatuses: payload.itemStatuses,
          status: allRejected
            ? ItemStatus.REJECTED
            : ItemStatus.LOGISTIC_APPROVED,
        };

        requests[index] = updated;
        saveToStorage("app_requests", requests);
        return updated;
      });
    }

    return apiClient.patch<Request>(`/requests/${id}/approve`, payload);
  },

  /**
   * Reject request
   */
  reject: async (
    id: string,
    payload: { rejectedBy: string; rejectionReason: string },
  ): Promise<Request> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const requests = getFromStorage<Request[]>("app_requests") || [];
        const index = requests.findIndex((r) => r.id === id);
        if (index === -1) throw new ApiError("Request tidak ditemukan.", 404);

        const updated: Request = {
          ...requests[index],
          ...payload,
          rejectionDate: new Date().toISOString(),
          status: ItemStatus.REJECTED,
        };

        requests[index] = updated;
        saveToStorage("app_requests", requests);
        return updated;
      });
    }

    return apiClient.patch<Request>(`/requests/${id}/reject`, payload);
  },

  /**
   * Cancel request
   */
  cancel: async (id: string): Promise<Request> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const requests = getFromStorage<Request[]>("app_requests") || [];
        const index = requests.findIndex((r) => r.id === id);
        if (index === -1) throw new ApiError("Request tidak ditemukan.", 404);

        const updated: Request = {
          ...requests[index],
          status: ItemStatus.CANCELLED,
        };

        requests[index] = updated;
        saveToStorage("app_requests", requests);
        return updated;
      });
    }

    return apiClient.patch<Request>(`/requests/${id}/cancel`);
  },

  /**
   * Fill purchase details for item
   */
  fillPurchaseDetails: async (
    id: string,
    itemId: number,
    details: PurchaseDetails,
  ): Promise<Request> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const requests = getFromStorage<Request[]>("app_requests") || [];
        const index = requests.findIndex((r) => r.id === id);
        if (index === -1) throw new ApiError("Request tidak ditemukan.", 404);

        const updated: Request = {
          ...requests[index],
          purchaseDetails: {
            ...(requests[index].purchaseDetails || {}),
            [itemId]: details,
          },
        };

        requests[index] = updated;
        saveToStorage("app_requests", requests);
        return updated;
      });
    }

    return apiClient.patch<Request>(
      `/requests/${id}/items/${itemId}/purchase`,
      details,
    );
  },

  /**
   * Delete request
   */
  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const requests = getFromStorage<Request[]>("app_requests") || [];
        const updated = requests.filter((r) => r.id !== id);
        saveToStorage("app_requests", updated);
      });
    }

    return apiClient.delete(`/requests/${id}`);
  },

  /**
   * Register assets from completed request
   */
  registerAssets: async (
    id: string,
    itemId: number,
    count: number,
  ): Promise<Request> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const requests = getFromStorage<Request[]>("app_requests") || [];
        const index = requests.findIndex((r) => r.id === id);
        if (index === -1) throw new ApiError("Request tidak ditemukan.", 404);

        const request = requests[index];
        const current = request.partiallyRegisteredItems?.[itemId] || 0;

        const updated: Request = {
          ...request,
          partiallyRegisteredItems: {
            ...(request.partiallyRegisteredItems || {}),
            [itemId]: current + count,
          },
        };

        // Check if all items are fully registered
        const allRegistered = request.items.every((item) => {
          const registered = updated.partiallyRegisteredItems?.[item.id] || 0;
          const approved =
            request.itemStatuses?.[item.id]?.approvedQuantity || item.quantity;
          return registered >= approved;
        });

        if (allRegistered) {
          updated.isRegistered = true;
          updated.status = ItemStatus.COMPLETED;
        }

        requests[index] = updated;
        saveToStorage("app_requests", requests);
        return updated;
      });
    }

    return apiClient.post<Request>(`/requests/${id}/register-assets`, {
      itemId,
      count,
    });
  },
};
