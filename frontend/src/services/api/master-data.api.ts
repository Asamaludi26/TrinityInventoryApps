/**
 * Master Data API Service
 * Handles: Users, Customers, Divisions, Categories
 *
 * Pure API implementation - no mock logic
 */

import { apiClient } from "./client";
import {
  User,
  Customer,
  Division,
  AssetCategory,
  CustomerStatus,
} from "../../types";
import {
  transformBackendUser,
  transformBackendCustomer,
  toBackendUserRole,
  toBackendCustomerStatus,
} from "../../utils/enumMapper";

// --- USERS ---
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const data = await apiClient.get<any[]>("/users");
    return data.map(transformBackendUser);
  },

  getById: async (id: number): Promise<User | null> => {
    try {
      const data = await apiClient.get<any>(`/users/${id}`);
      return transformBackendUser(data);
    } catch {
      return null;
    }
  },

  create: async (data: Omit<User, "id">): Promise<User> => {
    const payload = {
      ...data,
      role: data.role ? toBackendUserRole(data.role) : undefined,
    };
    const result = await apiClient.post<any>("/users", payload);
    return transformBackendUser(result);
  },

  update: async (id: number, data: Partial<User>): Promise<User> => {
    const payload = {
      ...data,
      role: data.role ? toBackendUserRole(data.role) : undefined,
    };
    const result = await apiClient.patch<any>(`/users/${id}`, payload);
    return transformBackendUser(result);
  },

  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`/users/${id}`);
  },

  resetPassword: async (id: number): Promise<void> => {
    return apiClient.post(`/users/${id}/reset-password`);
  },
};

// --- CUSTOMERS ---
export const customersApi = {
  getAll: async (): Promise<Customer[]> => {
    const data = await apiClient.get<any[]>("/customers");
    return data.map(transformBackendCustomer);
  },

  getById: async (id: string): Promise<Customer | null> => {
    try {
      const data = await apiClient.get<any>(`/customers/${id}`);
      return transformBackendCustomer(data);
    } catch {
      return null;
    }
  },

  create: async (data: Omit<Customer, "id">): Promise<Customer> => {
    const payload = {
      ...data,
      status: data.status ? toBackendCustomerStatus(data.status) : undefined,
    };
    const result = await apiClient.post<any>("/customers", payload);
    return transformBackendCustomer(result);
  },

  update: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    const payload = {
      ...data,
      status: data.status ? toBackendCustomerStatus(data.status) : undefined,
    };
    const result = await apiClient.patch<any>(`/customers/${id}`, payload);
    return transformBackendCustomer(result);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/customers/${id}`);
  },

  updateStatus: async (
    id: string,
    status: CustomerStatus,
  ): Promise<Customer> => {
    const backendStatus = toBackendCustomerStatus(status);
    const result = await apiClient.patch<any>(`/customers/${id}/status`, {
      status: backendStatus,
    });
    return transformBackendCustomer(result);
  },
};

// --- DIVISIONS ---
export const divisionsApi = {
  getAll: async (): Promise<Division[]> => {
    return apiClient.get<Division[]>("/divisions");
  },

  create: async (data: Omit<Division, "id">): Promise<Division> => {
    return apiClient.post<Division>("/divisions", data);
  },

  update: async (id: number, data: Partial<Division>): Promise<Division> => {
    return apiClient.patch<Division>(`/divisions/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`/divisions/${id}`);
  },
};

// --- CATEGORIES ---
export const categoriesApi = {
  getAll: async (): Promise<AssetCategory[]> => {
    return apiClient.get<AssetCategory[]>("/categories");
  },

  getById: async (id: number): Promise<AssetCategory | null> => {
    try {
      return apiClient.get<AssetCategory>(`/categories/${id}`);
    } catch {
      return null;
    }
  },

  create: async (data: Omit<AssetCategory, "id">): Promise<AssetCategory> => {
    return apiClient.post<AssetCategory>("/categories", data);
  },

  update: async (
    id: number,
    data: Partial<AssetCategory>,
  ): Promise<AssetCategory> => {
    return apiClient.patch<AssetCategory>(`/categories/${id}`, data);
  },

  /**
   * Update all categories (bulk update)
   * Uses PUT /categories for atomic bulk update
   */
  updateAll: async (categories: AssetCategory[]): Promise<AssetCategory[]> => {
    // Filter out categories without valid IDs for update
    const validCategories = categories.filter(
      (cat) => cat.id && typeof cat.id === "number",
    );

    if (validCategories.length === 0) {
      console.warn("[categoriesApi] No valid categories to update");
      return [];
    }

    // Prepare payload - only send fields that backend accepts
    const payload = validCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      isCustomerInstallable: cat.isCustomerInstallable,
      associatedDivisions: cat.associatedDivisions,
    }));

    try {
      // Use PUT for bulk update (atomic transaction on backend)
      const results = await apiClient.put<AssetCategory[]>(
        "/categories",
        payload,
      );
      return results;
    } catch (err) {
      console.error("[categoriesApi] Bulk update failed:", err);
      throw err;
    }
  },

  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`/categories/${id}`);
  },
};
