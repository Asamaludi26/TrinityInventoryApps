/**
 * Master Data API Service
 * Handles: Users, Customers, Divisions, Categories
 */

import { apiClient, USE_MOCK, ApiError } from "./client";
import {
  User,
  Customer,
  Division,
  AssetCategory,
  CustomerStatus,
  StockMovement,
} from "../../types";

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

// --- USERS ---
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        return getFromStorage<User[]>("app_users") || [];
      });
    }
    return apiClient.get<User[]>("/users");
  },

  getById: async (id: number): Promise<User | null> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const users = getFromStorage<User[]>("app_users") || [];
        return users.find((u) => u.id === id) || null;
      });
    }
    return apiClient.get<User>(`/users/${id}`);
  },

  create: async (data: Omit<User, "id">): Promise<User> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const users = getFromStorage<User[]>("app_users") || [];
        const maxId = Math.max(0, ...users.map((u) => u.id));
        const newUser: User = {
          ...data,
          id: maxId + 1,
        };
        const updated = [newUser, ...users];
        saveToStorage("app_users", updated);
        return newUser;
      });
    }
    return apiClient.post<User>("/users", data);
  },

  update: async (id: number, data: Partial<User>): Promise<User> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const users = getFromStorage<User[]>("app_users") || [];
        const index = users.findIndex((u) => u.id === id);
        if (index === -1) throw new ApiError("User tidak ditemukan.", 404);

        const updated = { ...users[index], ...data };
        users[index] = updated;
        saveToStorage("app_users", users);
        return updated;
      });
    }
    return apiClient.patch<User>(`/users/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const users = getFromStorage<User[]>("app_users") || [];
        const updated = users.filter((u) => u.id !== id);
        saveToStorage("app_users", updated);
      });
    }
    return apiClient.delete(`/users/${id}`);
  },

  resetPassword: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const users = getFromStorage<User[]>("app_users") || [];
        const index = users.findIndex((u) => u.id === id);
        if (index !== -1) {
          users[index] = {
            ...users[index],
            passwordResetRequested: false,
            passwordResetRequestDate: undefined,
          };
          saveToStorage("app_users", users);
        }
      });
    }
    return apiClient.post(`/users/${id}/reset-password`);
  },
};

// --- CUSTOMERS ---
export const customersApi = {
  getAll: async (): Promise<Customer[]> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        return getFromStorage<Customer[]>("app_customers") || [];
      });
    }
    return apiClient.get<Customer[]>("/customers");
  },

  getById: async (id: string): Promise<Customer | null> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const customers = getFromStorage<Customer[]>("app_customers") || [];
        return customers.find((c) => c.id === id) || null;
      });
    }
    return apiClient.get<Customer>(`/customers/${id}`);
  },

  create: async (data: Omit<Customer, "id">): Promise<Customer> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const customers = getFromStorage<Customer[]>("app_customers") || [];
        const newCustomer: Customer = {
          ...data,
          id: `CUST-${Date.now()}`,
        };
        const updated = [newCustomer, ...customers];
        saveToStorage("app_customers", updated);
        return newCustomer;
      });
    }
    return apiClient.post<Customer>("/customers", data);
  },

  update: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const customers = getFromStorage<Customer[]>("app_customers") || [];
        const index = customers.findIndex((c) => c.id === id);
        if (index === -1) throw new ApiError("Customer tidak ditemukan.", 404);

        const updated = { ...customers[index], ...data };
        customers[index] = updated;
        saveToStorage("app_customers", customers);
        return updated;
      });
    }
    return apiClient.patch<Customer>(`/customers/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const customers = getFromStorage<Customer[]>("app_customers") || [];
        const updated = customers.filter((c) => c.id !== id);
        saveToStorage("app_customers", updated);
      });
    }
    return apiClient.delete(`/customers/${id}`);
  },

  updateStatus: async (
    id: string,
    status: CustomerStatus,
  ): Promise<Customer> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const customers = getFromStorage<Customer[]>("app_customers") || [];
        const index = customers.findIndex((c) => c.id === id);
        if (index === -1) throw new ApiError("Customer tidak ditemukan.", 404);

        customers[index] = { ...customers[index], status };
        saveToStorage("app_customers", customers);
        return customers[index];
      });
    }
    return apiClient.patch<Customer>(`/customers/${id}/status`, { status });
  },
};

// --- DIVISIONS ---
export const divisionsApi = {
  getAll: async (): Promise<Division[]> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        return getFromStorage<Division[]>("app_divisions") || [];
      });
    }
    return apiClient.get<Division[]>("/divisions");
  },

  create: async (data: Omit<Division, "id">): Promise<Division> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const divisions = getFromStorage<Division[]>("app_divisions") || [];
        const maxId = Math.max(0, ...divisions.map((d) => d.id));
        const newDivision: Division = {
          ...data,
          id: maxId + 1,
        };
        const updated = [...divisions, newDivision];
        saveToStorage("app_divisions", updated);
        return newDivision;
      });
    }
    return apiClient.post<Division>("/divisions", data);
  },

  update: async (id: number, data: Partial<Division>): Promise<Division> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const divisions = getFromStorage<Division[]>("app_divisions") || [];
        const index = divisions.findIndex((d) => d.id === id);
        if (index === -1) throw new ApiError("Division tidak ditemukan.", 404);

        const updated = { ...divisions[index], ...data };
        divisions[index] = updated;
        saveToStorage("app_divisions", divisions);
        return updated;
      });
    }
    return apiClient.patch<Division>(`/divisions/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const divisions = getFromStorage<Division[]>("app_divisions") || [];
        const updated = divisions.filter((d) => d.id !== id);
        saveToStorage("app_divisions", updated);
      });
    }
    return apiClient.delete(`/divisions/${id}`);
  },
};

// --- CATEGORIES ---
export const categoriesApi = {
  getAll: async (): Promise<AssetCategory[]> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        return getFromStorage<AssetCategory[]>("app_assetCategories") || [];
      });
    }
    return apiClient.get<AssetCategory[]>("/categories");
  },

  update: async (categories: AssetCategory[]): Promise<AssetCategory[]> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        saveToStorage("app_assetCategories", categories);
        return categories;
      });
    }
    return apiClient.put<AssetCategory[]>("/categories", categories);
  },
};
