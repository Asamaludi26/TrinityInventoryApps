/**
 * Assets API Service
 * Pure API calls - no mock logic
 */

import { apiClient } from "./client";
import { Asset } from "../../types";
import {
  transformBackendAsset,
  toBackendAssetStatus,
  BackendAssetStatus,
} from "../../utils/enumMapper";

export interface AssetFilters {
  status?: string;
  category?: string;
  location?: string;
  currentUser?: string;
  search?: string;
  skip?: number;
  take?: number;
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
    const params = new URLSearchParams();
    if (filters) {
      if (filters.status) {
        // Convert frontend status to backend status
        params.append("status", toBackendAssetStatus(filters.status as any));
      }
      if (filters.search) params.append("search", filters.search);
      if (filters.location) params.append("location", filters.location);
      if (filters.currentUser)
        params.append("currentUserId", filters.currentUser);
      if (filters.skip) params.append("skip", String(filters.skip));
      if (filters.take) params.append("take", String(filters.take));
    }
    const query = params.toString();
    const response = await apiClient.get<any[]>(
      `/assets${query ? `?${query}` : ""}`,
    );
    return response.map(transformBackendAsset);
  },

  /**
   * Get single asset by ID
   */
  getById: async (id: string): Promise<Asset | null> => {
    try {
      const response = await apiClient.get<any>(`/assets/${id}`);
      return transformBackendAsset(response);
    } catch (error: any) {
      if (error?.status === 404) return null;
      throw error;
    }
  },

  /**
   * Create new asset
   */
  create: async (data: Partial<Asset>): Promise<Asset> => {
    const backendData = {
      id: data.id,
      name: data.name,
      brand: data.brand,
      serialNumber: data.serialNumber,
      macAddress: data.macAddress,
      status: data.status
        ? toBackendAssetStatus(data.status as any)
        : "IN_STORAGE",
      condition: data.condition || "GOOD",
      location: data.location,
      locationDetail: data.locationDetail,
      purchasePrice: data.purchasePrice,
      purchaseDate: data.purchaseDate,
      vendor: data.vendor,
      poNumber: data.poNumber,
      invoiceNumber: data.invoiceNumber,
      warrantyEndDate: data.warrantyEndDate,
      initialBalance: data.initialBalance,
      currentBalance: data.currentBalance,
      quantity: data.quantity,
      woRoIntNumber: data.woRoIntNumber,
    };
    const response = await apiClient.post<any>("/assets", backendData);
    return transformBackendAsset(response);
  },

  /**
   * Update asset
   */
  update: async (id: string, data: Partial<Asset>): Promise<Asset> => {
    const backendData: any = { ...data };
    if (data.status) {
      backendData.status = toBackendAssetStatus(data.status as any);
    }
    const response = await apiClient.patch<any>(`/assets/${id}`, backendData);
    return transformBackendAsset(response);
  },

  /**
   * Update asset status
   */
  updateStatus: async (id: string, status: string): Promise<Asset> => {
    const backendStatus = toBackendAssetStatus(status as any);
    const response = await apiClient.patch<any>(`/assets/${id}/status`, {
      status: backendStatus,
    });
    return transformBackendAsset(response);
  },

  /**
   * Batch update multiple assets
   */
  updateBatch: async (
    ids: string[],
    data: Partial<Asset>,
    referenceId?: string,
  ): Promise<Asset[]> => {
    const backendData: any = { ...data };
    if (data.status) {
      backendData.status = toBackendAssetStatus(data.status as any);
    }
    const response = await apiClient.patch<any[]>("/assets/batch", {
      ids,
      data: backendData,
      referenceId,
    });
    return response.map(transformBackendAsset);
  },

  /**
   * Delete asset (soft delete)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/assets/${id}`);
  },

  /**
   * Check stock availability
   */
  checkAvailability: async (
    name: string,
    brand: string,
    quantity: number,
  ): Promise<{
    isSufficient: boolean;
    available: number;
    requested: number;
    deficit: number;
    assetIds: string[];
  }> => {
    const params = new URLSearchParams({
      name,
      brand,
      quantity: String(quantity),
    });
    return apiClient.get(`/assets/check-availability?${params.toString()}`);
  },

  /**
   * Get stock summary
   */
  getStockSummary: async (): Promise<any[]> => {
    return apiClient.get("/assets/stock-summary");
  },

  /**
   * Consume materials (for installation/maintenance)
   */
  consume: async (
    materials: ConsumeMaterial[],
    context: ConsumeContext,
  ): Promise<{ success: boolean; errors: string[] }> => {
    return apiClient.post("/assets/consume", { items: materials, context });
  },
};
