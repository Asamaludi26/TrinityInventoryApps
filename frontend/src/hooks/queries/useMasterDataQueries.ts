/**
 * Master Data Query Hooks
 *
 * TanStack Query hooks for users, customers, divisions, categories, and stock.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  usersApi,
  customersApi,
  divisionsApi,
  categoriesApi,
  stockApi,
} from "../../services/api/master-data.api";
import type {
  User,
  Customer,
  Division,
  AssetCategory,
  CustomerStatus,
  StockMovement,
} from "../../types";

// Query keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  detail: (id: number) => [...userKeys.all, "detail", id] as const,
};

export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  detail: (id: string) => [...customerKeys.all, "detail", id] as const,
};

export const divisionKeys = {
  all: ["divisions"] as const,
  lists: () => [...divisionKeys.all, "list"] as const,
};

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
};

export const stockKeys = {
  all: ["stock"] as const,
  lists: () => [...stockKeys.all, "list"] as const,
  byAsset: (assetId: string) => [...stockKeys.all, "asset", assetId] as const,
};

// --- USERS ---

export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => usersApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<User, "id">) => usersApi.create(data),
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      if (newUser) {
        queryClient.setQueryData(userKeys.detail(newUser.id), newUser);
      }
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) =>
      usersApi.update(id, data),
    onSuccess: (updatedUser, { id }) => {
      queryClient.setQueryData(userKeys.detail(id), updatedUser);
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: (id: number) => usersApi.resetPassword(id),
  });
}

// --- CUSTOMERS ---

export function useCustomers() {
  return useQuery({
    queryKey: customerKeys.lists(),
    queryFn: () => customersApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Customer, "id">) => customersApi.create(data),
    onSuccess: (newCustomer) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      if (newCustomer) {
        queryClient.setQueryData(
          customerKeys.detail(newCustomer.id),
          newCustomer,
        );
      }
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) =>
      customersApi.update(id, data),
    onSuccess: (updatedCustomer, { id }) => {
      queryClient.setQueryData(customerKeys.detail(id), updatedCustomer);
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customersApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: customerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

export function useUpdateCustomerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CustomerStatus }) =>
      customersApi.updateStatus(id, status),
    onSuccess: (updatedCustomer, { id }) => {
      queryClient.setQueryData(customerKeys.detail(id), updatedCustomer);
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

// --- DIVISIONS ---

export function useDivisions() {
  return useQuery({
    queryKey: divisionKeys.lists(),
    queryFn: () => divisionsApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateDivision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Division, "id">) => divisionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: divisionKeys.lists() });
    },
  });
}

export function useUpdateDivision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Division> }) =>
      divisionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: divisionKeys.lists() });
    },
  });
}

export function useDeleteDivision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => divisionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: divisionKeys.lists() });
    },
  });
}

// --- CATEGORIES ---

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: () => categoriesApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categories: AssetCategory[]) =>
      categoriesApi.update(categories),
    onSuccess: (updatedCategories) => {
      queryClient.setQueryData(categoryKeys.lists(), updatedCategories);
    },
  });
}

// --- STOCK MOVEMENTS ---

export function useStockMovements(filters?: {
  assetName?: string;
  brand?: string;
}) {
  return useQuery({
    queryKey: stockKeys.lists(),
    queryFn: () => stockApi.getMovements(filters?.assetName, filters?.brand),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecordStockMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (movement: Omit<StockMovement, "id" | "balanceAfter">) =>
      stockApi.recordMovement(movement),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
    },
  });
}
