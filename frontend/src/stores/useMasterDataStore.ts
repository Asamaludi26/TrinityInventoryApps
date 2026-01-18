/**
 * Master Data Store (Refactored)
 *
 * Manages users, divisions, and customers data.
 * Uses modular API services for backend communication.
 */

import { create } from "zustand";
import { User, Division, Customer } from "../types";
import {
  usersApi,
  divisionsApi,
  customersApi,
  unifiedApi,
  USE_MOCK,
  mockStorage,
} from "../services/api";

interface MasterDataState {
  users: User[];
  divisions: Division[];
  customers: Customer[];
  isLoading: boolean;

  fetchMasterData: () => Promise<void>;

  addUser: (user: Omit<User, "id">) => Promise<User>;
  updateUser: (id: number, data: Partial<User>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;

  addDivision: (division: Omit<Division, "id">) => Promise<Division>;
  updateDivision: (id: number, data: Partial<Division>) => Promise<void>;
  deleteDivision: (id: number) => Promise<void>;

  addCustomer: (customer: Customer) => Promise<Customer>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
}

export const useMasterDataStore = create<MasterDataState>((set, get) => ({
  users: [],
  divisions: [],
  customers: [],
  isLoading: false,

  fetchMasterData: async () => {
    set({ isLoading: true });
    try {
      const [users, divisions, customers] = await Promise.all([
        unifiedApi.refreshUsers(),
        USE_MOCK
          ? Promise.resolve(mockStorage.get<Division[]>("app_divisions") || [])
          : divisionsApi.getAll(),
        unifiedApi.refreshCustomers(),
      ]);

      set({
        users,
        divisions,
        customers,
        isLoading: false,
      });
    } catch (error) {
      console.error("[MasterDataStore] fetchMasterData failed:", error);
      set({ isLoading: false });
    }
  },

  // --- USERS ---
  addUser: async (userData) => {
    try {
      const newUser = await usersApi.create(userData);
      set((state) => ({ users: [newUser, ...state.users] }));
      return newUser;
    } catch (error) {
      console.error("[MasterDataStore] addUser failed:", error);
      throw error;
    }
  },

  updateUser: async (id, data) => {
    try {
      const updatedUser = await usersApi.update(id, data);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updatedUser : u)),
      }));
    } catch (error) {
      console.error("[MasterDataStore] updateUser failed:", error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      await usersApi.delete(id);
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
      }));
    } catch (error) {
      console.error("[MasterDataStore] deleteUser failed:", error);
      throw error;
    }
  },

  // --- DIVISIONS ---
  addDivision: async (divData) => {
    try {
      const newDivision = await divisionsApi.create(divData);
      set((state) => ({ divisions: [newDivision, ...state.divisions] }));
      return newDivision;
    } catch (error) {
      console.error("[MasterDataStore] addDivision failed:", error);
      throw error;
    }
  },

  updateDivision: async (id, data) => {
    try {
      const updated = await divisionsApi.update(id, data);
      set((state) => ({
        divisions: state.divisions.map((d) => (d.id === id ? updated : d)),
      }));
    } catch (error) {
      console.error("[MasterDataStore] updateDivision failed:", error);
      throw error;
    }
  },

  deleteDivision: async (id) => {
    try {
      await divisionsApi.delete(id);
      set((state) => ({
        divisions: state.divisions.filter((d) => d.id !== id),
      }));
    } catch (error) {
      console.error("[MasterDataStore] deleteDivision failed:", error);
      throw error;
    }
  },

  // --- CUSTOMERS ---
  addCustomer: async (customer) => {
    try {
      const newCustomer = await customersApi.create(customer);
      set((state) => ({ customers: [newCustomer, ...state.customers] }));
      return newCustomer;
    } catch (error) {
      console.error("[MasterDataStore] addCustomer failed:", error);
      throw error;
    }
  },

  updateCustomer: async (id, data) => {
    try {
      const updated = await customersApi.update(id, data);
      set((state) => ({
        customers: state.customers.map((c) => (c.id === id ? updated : c)),
      }));
    } catch (error) {
      console.error("[MasterDataStore] updateCustomer failed:", error);
      throw error;
    }
  },

  deleteCustomer: async (id) => {
    try {
      await customersApi.delete(id);
      set((state) => ({
        customers: state.customers.filter((c) => c.id !== id),
      }));
    } catch (error) {
      console.error("[MasterDataStore] deleteCustomer failed:", error);
      throw error;
    }
  },
}));
