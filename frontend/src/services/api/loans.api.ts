/**
 * Loan Requests API Service
 */

import { apiClient, USE_MOCK, ApiError } from "./client";
import {
  LoanRequest,
  LoanRequestStatus,
  AssetStatus,
  AssetCondition,
  AssetReturn,
  AssetReturnStatus,
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

export interface LoanFilters {
  status?: LoanRequestStatus;
  requester?: string;
  division?: string;
}

export interface ApproveLoanPayload {
  approver: string;
  approvalDate: string;
  assignedAssetIds: Record<number, string[]>;
  itemStatuses: Record<
    number,
    {
      status: "approved" | "rejected" | "partial";
      reason?: string;
      approvedQuantity?: number;
    }
  >;
}

export interface ReturnItem {
  assetId: string;
  condition: AssetCondition;
  notes?: string;
}

export const loansApi = {
  /**
   * Get all loan requests
   */
  getAll: async (filters?: LoanFilters): Promise<LoanRequest[]> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        let loans = getFromStorage<LoanRequest[]>("app_loanRequests") || [];

        if (filters) {
          if (filters.status) {
            loans = loans.filter((l) => l.status === filters.status);
          }
          if (filters.requester) {
            loans = loans.filter((l) => l.requester === filters.requester);
          }
          if (filters.division) {
            loans = loans.filter((l) => l.division === filters.division);
          }
        }

        return loans.sort(
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
    return apiClient.get<LoanRequest[]>(
      `/loan-requests${query ? `?${query}` : ""}`,
    );
  },

  /**
   * Get single loan request
   */
  getById: async (id: string): Promise<LoanRequest | null> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const loans = getFromStorage<LoanRequest[]>("app_loanRequests") || [];
        return loans.find((l) => l.id === id) || null;
      });
    }

    return apiClient.get<LoanRequest>(`/loan-requests/${id}`);
  },

  /**
   * Create loan request
   */
  create: async (
    data: Omit<LoanRequest, "id" | "status">,
  ): Promise<LoanRequest> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const loans = getFromStorage<LoanRequest[]>("app_loanRequests") || [];
        const requestDate = new Date(data.requestDate);
        const docsForGenerator = loans.map((l) => ({ docNumber: l.id }));
        const newId = generateDocumentNumber(
          "LN",
          docsForGenerator,
          requestDate,
        );

        const newLoan: LoanRequest = {
          ...data,
          id: newId,
          status: LoanRequestStatus.PENDING,
        };

        const updated = [newLoan, ...loans];
        saveToStorage("app_loanRequests", updated);
        return newLoan;
      });
    }

    return apiClient.post<LoanRequest>("/loan-requests", data);
  },

  /**
   * Update loan request
   */
  update: async (
    id: string,
    data: Partial<LoanRequest>,
  ): Promise<LoanRequest> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const loans = getFromStorage<LoanRequest[]>("app_loanRequests") || [];
        const index = loans.findIndex((l) => l.id === id);
        if (index === -1)
          throw new ApiError("Loan request tidak ditemukan.", 404);

        const updated = { ...loans[index], ...data };
        loans[index] = updated;
        saveToStorage("app_loanRequests", loans);
        return updated;
      });
    }

    return apiClient.patch<LoanRequest>(`/loan-requests/${id}`, data);
  },

  /**
   * Approve loan request with asset assignment
   */
  approve: async (
    id: string,
    payload: ApproveLoanPayload,
  ): Promise<LoanRequest> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const loans = getFromStorage<LoanRequest[]>("app_loanRequests") || [];
        const assets = getFromStorage<any[]>("app_assets") || [];
        const index = loans.findIndex((l) => l.id === id);
        if (index === -1)
          throw new ApiError("Loan request tidak ditemukan.", 404);

        const loan = loans[index];
        const allRejected = Object.values(payload.itemStatuses).every(
          (s) => s.status === "rejected",
        );

        // Update loan
        const updatedLoan: LoanRequest = {
          ...loan,
          approver: payload.approver,
          approvalDate: payload.approvalDate,
          assignedAssetIds: payload.assignedAssetIds,
          itemStatuses: payload.itemStatuses,
          status: allRejected
            ? LoanRequestStatus.REJECTED
            : LoanRequestStatus.APPROVED,
        };

        loans[index] = updatedLoan;
        saveToStorage("app_loanRequests", loans);

        // Update assets if approved
        if (!allRejected) {
          const assetIds = Object.values(payload.assignedAssetIds).flat();
          const updatedAssets = assets.map((a) => {
            if (assetIds.includes(a.id)) {
              return {
                ...a,
                status: AssetStatus.IN_USE,
                currentUser: loan.requester,
                location: `Dipinjam: ${loan.requester}`,
              };
            }
            return a;
          });
          saveToStorage("app_assets", updatedAssets);
        }

        return updatedLoan;
      });
    }

    return apiClient.patch<LoanRequest>(
      `/loan-requests/${id}/approve`,
      payload,
    );
  },

  /**
   * Reject loan request
   */
  reject: async (
    id: string,
    payload: { rejectionReason: string },
  ): Promise<LoanRequest> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const loans = getFromStorage<LoanRequest[]>("app_loanRequests") || [];
        const index = loans.findIndex((l) => l.id === id);
        if (index === -1)
          throw new ApiError("Loan request tidak ditemukan.", 404);

        const updated: LoanRequest = {
          ...loans[index],
          rejectionReason: payload.rejectionReason,
          status: LoanRequestStatus.REJECTED,
        };

        loans[index] = updated;
        saveToStorage("app_loanRequests", updated);
        return updated;
      });
    }

    return apiClient.patch<LoanRequest>(`/loan-requests/${id}/reject`, payload);
  },

  /**
   * Submit return request
   */
  submitReturn: async (
    loanRequestId: string,
    returnItems: ReturnItem[],
  ): Promise<AssetReturn> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const loans = getFromStorage<LoanRequest[]>("app_loanRequests") || [];
        const returns = getFromStorage<AssetReturn[]>("app_returns") || [];
        const assets = getFromStorage<any[]>("app_assets") || [];

        const loan = loans.find((l) => l.id === loanRequestId);
        if (!loan) throw new ApiError("Loan request tidak ditemukan.", 404);

        const docsForGenerator = returns.map((r) => ({
          docNumber: r.docNumber,
        }));
        const docNumber = generateDocumentNumber(
          "RTN",
          docsForGenerator,
          new Date(),
        );

        const newReturn: AssetReturn = {
          id: `return_${Date.now()}`,
          docNumber,
          returnDate: new Date().toISOString(),
          loanRequestId,
          returnedBy: loan.requester,
          items: returnItems.map((item) => {
            const asset = assets.find((a) => a.id === item.assetId);
            return {
              assetId: item.assetId,
              assetName: asset?.name || "Unknown",
              returnedCondition: item.condition,
              notes: item.notes,
              status: "PENDING" as const,
            };
          }),
          status: AssetReturnStatus.PENDING_APPROVAL,
        };

        // Update loan status
        const loanIndex = loans.findIndex((l) => l.id === loanRequestId);
        loans[loanIndex] = {
          ...loans[loanIndex],
          status: LoanRequestStatus.AWAITING_RETURN,
        };
        saveToStorage("app_loanRequests", loans);

        // Save return
        const updatedReturns = [newReturn, ...returns];
        saveToStorage("app_returns", updatedReturns);

        return newReturn;
      });
    }

    return apiClient.post<AssetReturn>(
      `/loan-requests/${loanRequestId}/return`,
      {
        items: returnItems,
      },
    );
  },

  /**
   * Delete loan request
   */
  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const loans = getFromStorage<LoanRequest[]>("app_loanRequests") || [];
        const updated = loans.filter((l) => l.id !== id);
        saveToStorage("app_loanRequests", updated);
      });
    }

    return apiClient.delete(`/loan-requests/${id}`);
  },
};

// --- Returns API ---
export const returnsApi = {
  /**
   * Get all returns
   */
  getAll: async (): Promise<AssetReturn[]> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        return getFromStorage<AssetReturn[]>("app_returns") || [];
      });
    }

    return apiClient.get<AssetReturn[]>("/returns");
  },

  /**
   * Get single return
   */
  getById: async (id: string): Promise<AssetReturn | null> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const returns = getFromStorage<AssetReturn[]>("app_returns") || [];
        return returns.find((r) => r.id === id) || null;
      });
    }

    return apiClient.get<AssetReturn>(`/returns/${id}`);
  },

  /**
   * Verify return (accept/reject items)
   */
  verify: async (
    id: string,
    acceptedAssetIds: string[],
    verifiedBy: string,
  ): Promise<AssetReturn> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const returns = getFromStorage<AssetReturn[]>("app_returns") || [];
        const assets = getFromStorage<any[]>("app_assets") || [];
        const loans = getFromStorage<LoanRequest[]>("app_loanRequests") || [];

        const index = returns.findIndex((r) => r.id === id);
        if (index === -1)
          throw new ApiError("Return document tidak ditemukan.", 404);

        const returnDoc = returns[index];

        // Update return items
        const updatedItems = returnDoc.items.map((item) => ({
          ...item,
          status: acceptedAssetIds.includes(item.assetId)
            ? ("ACCEPTED" as const)
            : ("REJECTED" as const),
        }));

        const updatedReturn: AssetReturn = {
          ...returnDoc,
          items: updatedItems,
          verifiedBy,
          verificationDate: new Date().toISOString(),
          status: AssetReturnStatus.COMPLETED,
        };

        returns[index] = updatedReturn;
        saveToStorage("app_returns", returns);

        // Update assets
        const updatedAssets = assets.map((a) => {
          if (acceptedAssetIds.includes(a.id)) {
            const returnItem = returnDoc.items.find((i) => i.assetId === a.id);
            return {
              ...a,
              status: AssetStatus.IN_STORAGE,
              currentUser: null,
              condition: returnItem?.returnedCondition || a.condition,
              location: "Gudang Inventori",
            };
          }
          return a;
        });
        saveToStorage("app_assets", updatedAssets);

        // Update loan status
        const loanIndex = loans.findIndex(
          (l) => l.id === returnDoc.loanRequestId,
        );
        if (loanIndex !== -1) {
          loans[loanIndex] = {
            ...loans[loanIndex],
            status: LoanRequestStatus.RETURNED,
            actualReturnDate: new Date().toISOString(),
          };
          saveToStorage("app_loanRequests", loans);
        }

        return updatedReturn;
      });
    }

    return apiClient.patch<AssetReturn>(`/returns/${id}/verify`, {
      acceptedAssetIds,
      verifiedBy,
    });
  },

  /**
   * Create new return document
   */
  create: async (returnData: AssetReturn): Promise<AssetReturn> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const returns = getFromStorage<AssetReturn[]>("app_returns") || [];
        const updated = [returnData, ...returns];
        saveToStorage("app_returns", updated);
        return returnData;
      });
    }

    return apiClient.post<AssetReturn>("/returns", returnData);
  },

  /**
   * Update return document
   */
  update: async (
    id: string,
    data: Partial<AssetReturn>,
  ): Promise<AssetReturn> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const returns = getFromStorage<AssetReturn[]>("app_returns") || [];
        const index = returns.findIndex((r) => r.id === id);
        if (index === -1)
          throw new ApiError("Return document tidak ditemukan.", 404);

        const updated = { ...returns[index], ...data };
        returns[index] = updated;
        saveToStorage("app_returns", returns);
        return updated;
      });
    }

    return apiClient.patch<AssetReturn>(`/returns/${id}`, data);
  },
};
