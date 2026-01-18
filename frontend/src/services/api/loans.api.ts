/**
 * Loan Requests API Service
 * Pure API calls - no mock logic
 */

import { apiClient } from "./client";
import { LoanRequest, AssetCondition, AssetReturn } from "../../types";
import {
  transformBackendLoanRequest,
  transformBackendAssetReturn,
  toBackendLoanStatus,
} from "../../utils/enumMapper";

export interface LoanFilters {
  status?: string;
  requester?: string;
  division?: string;
  skip?: number;
  take?: number;
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
  assetName?: string;
  condition?: AssetCondition;
  returnedCondition?: AssetCondition;
  notes?: string;
}

export const loansApi = {
  /**
   * Get all loan requests
   */
  getAll: async (filters?: LoanFilters): Promise<LoanRequest[]> => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.status) {
        params.append("status", toBackendLoanStatus(filters.status as any));
      }
      if (filters.requester) params.append("requesterId", filters.requester);
      if (filters.skip) params.append("skip", String(filters.skip));
      if (filters.take) params.append("take", String(filters.take));
    }
    const query = params.toString();
    const response = await apiClient.get<any[]>(
      `/loan-requests${query ? `?${query}` : ""}`,
    );
    return (response || []).map(transformBackendLoanRequest);
  },

  /**
   * Get single loan request
   */
  getById: async (id: string): Promise<LoanRequest | null> => {
    try {
      const response = await apiClient.get<any>(`/loan-requests/${id}`);
      return transformBackendLoanRequest(response);
    } catch (error: any) {
      if (error?.status === 404) return null;
      throw error;
    }
  },

  /**
   * Create loan request
   */
  create: async (
    data: Omit<LoanRequest, "id" | "status">,
  ): Promise<LoanRequest> => {
    const backendData = {
      requestDate: data.requestDate,
      purpose: data.notes,
      expectedReturn: data.items?.[0]?.returnDate,
      items: data.items.map((item) => ({
        itemName: item.itemName,
        brand: item.brand,
        quantity: item.quantity,
        notes: item.keterangan,
        unit: item.unit,
      })),
    };
    const response = await apiClient.post<any>("/loan-requests", backendData);
    return transformBackendLoanRequest(response);
  },

  /**
   * Update loan request
   */
  update: async (
    id: string,
    data: Partial<LoanRequest>,
  ): Promise<LoanRequest> => {
    const response = await apiClient.patch<any>(`/loan-requests/${id}`, data);
    return transformBackendLoanRequest(response);
  },

  /**
   * Approve loan request with asset assignment
   */
  approve: async (
    id: string,
    payload: ApproveLoanPayload,
  ): Promise<LoanRequest> => {
    const response = await apiClient.post<any>(
      `/loan-requests/${id}/approve`,
      payload,
    );
    return transformBackendLoanRequest(response);
  },

  /**
   * Reject loan request
   */
  reject: async (
    id: string,
    payload: { reason?: string; rejectionReason?: string },
  ): Promise<LoanRequest> => {
    // Support both formats
    const reason = payload.reason || payload.rejectionReason || "";
    const response = await apiClient.post<any>(`/loan-requests/${id}/reject`, {
      reason,
    });
    return transformBackendLoanRequest(response);
  },

  /**
   * Delete loan request
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/loan-requests/${id}`);
  },

  /**
   * Submit return for loan items
   * Supports multiple call signatures for backward compatibility
   */
  submitReturn: async (
    loanRequestIdOrData:
      | string
      | {
          loanRequestId: string;
          returnDate: string;
          items: ReturnItem[];
          receivedBy?: string;
          notes?: string;
        },
    items?: ReturnItem[],
  ): Promise<LoanRequest> => {
    // Support both signatures
    let requestData: any;
    let loanRequestId: string;

    if (typeof loanRequestIdOrData === "string") {
      loanRequestId = loanRequestIdOrData;
      requestData = {
        loanRequestId,
        returnDate: new Date().toISOString(),
        items: items || [],
      };
    } else {
      loanRequestId = loanRequestIdOrData.loanRequestId;
      requestData = loanRequestIdOrData;
    }

    const response = await apiClient.post<any>(
      `/loan-requests/${loanRequestId}/return`,
      requestData,
    );
    return transformBackendLoanRequest(response);
  },
};

// --- Returns API ---
export const returnsApi = {
  /**
   * Get all returns
   */
  getAll: async (loanRequestId?: string): Promise<AssetReturn[]> => {
    const params = loanRequestId ? `?loanRequestId=${loanRequestId}` : "";
    const data = await apiClient.get<any[]>(`/returns${params}`);
    return (data || []).map(transformBackendAssetReturn);
  },

  /**
   * Get single return
   */
  getById: async (id: string): Promise<AssetReturn | null> => {
    try {
      const data = await apiClient.get<any>(`/returns/${id}`);
      return transformBackendAssetReturn(data);
    } catch (error: any) {
      if (error?.status === 404) return null;
      throw error;
    }
  },

  /**
   * Create return document
   * Flexible input - accepts both ReturnItem and AssetReturnItem formats
   */
  create: async (returnData: {
    loanRequestId: string;
    returnDate: string;
    items: Array<ReturnItem | any>;
  }): Promise<AssetReturn> => {
    // Transform items to consistent format
    const transformedData = {
      ...returnData,
      items: returnData.items.map((item: any) => ({
        assetId: item.assetId,
        assetName: item.assetName,
        returnedCondition: item.returnedCondition || item.condition,
        notes: item.notes,
      })),
    };
    const response = await apiClient.post<any>("/returns", transformedData);
    return transformBackendAssetReturn(response);
  },

  /**
   * Process return (accept/reject items)
   */
  process: async (
    id: string,
    payload: {
      itemStatuses: Record<string, { accepted: boolean; notes?: string }>;
    },
  ): Promise<AssetReturn> => {
    const response = await apiClient.post<any>(`/returns/${id}/process`, payload);
    return transformBackendAssetReturn(response);
  },

  /**
   * Update return
   */
  update: async (
    id: string,
    data: Partial<AssetReturn>,
  ): Promise<AssetReturn> => {
    const response = await apiClient.patch<any>(`/returns/${id}`, data);
    return transformBackendAssetReturn(response);
  },

  /**
   * Verify return
   * Supports multiple call signatures for backward compatibility
   */
  verify: async (
    id: string,
    acceptedAssetIdsOrPayload:
      | string[]
      | { verifiedBy: string; notes?: string },
    verifiedBy?: string,
  ): Promise<AssetReturn> => {
    let payload: any;

    if (Array.isArray(acceptedAssetIdsOrPayload)) {
      payload = {
        acceptedAssetIds: acceptedAssetIdsOrPayload,
        verifiedBy: verifiedBy || "",
      };
    } else {
      payload = acceptedAssetIdsOrPayload;
    }

    const response = await apiClient.post<any>(`/returns/${id}/verify`, payload);
    return transformBackendAssetReturn(response);
  },
};
