/**
 * Transaction Query Hooks
 *
 * TanStack Query hooks for handovers, installations, maintenances, and dismantles.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  handoversApi,
  installationsApi,
  maintenancesApi,
  dismantlesApi,
} from "../../services/api/transactions.api";
import type {
  Handover,
  Installation,
  Maintenance,
  Dismantle,
} from "../../types";

// Query keys
export const handoverKeys = {
  all: ["handovers"] as const,
  lists: () => [...handoverKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...handoverKeys.lists(), filters] as const,
  detail: (id: string) => [...handoverKeys.all, "detail", id] as const,
};

export const installationKeys = {
  all: ["installations"] as const,
  lists: () => [...installationKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...installationKeys.lists(), filters] as const,
  detail: (id: string) => [...installationKeys.all, "detail", id] as const,
};

export const maintenanceKeys = {
  all: ["maintenances"] as const,
  lists: () => [...maintenanceKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...maintenanceKeys.lists(), filters] as const,
  detail: (id: string) => [...maintenanceKeys.all, "detail", id] as const,
};

export const dismantleKeys = {
  all: ["dismantles"] as const,
  lists: () => [...dismantleKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...dismantleKeys.lists(), filters] as const,
  detail: (id: string) => [...dismantleKeys.all, "detail", id] as const,
};

// --- HANDOVER QUERIES ---

export function useHandovers() {
  return useQuery({
    queryKey: handoverKeys.lists(),
    queryFn: () => handoversApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useHandover(id: string) {
  return useQuery({
    queryKey: handoverKeys.detail(id),
    queryFn: () => handoversApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateHandover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Handover, "id" | "docNumber">) =>
      handoversApi.create(data),
    onSuccess: (newHandover) => {
      queryClient.invalidateQueries({ queryKey: handoverKeys.lists() });
      if (newHandover) {
        queryClient.setQueryData(
          handoverKeys.detail(newHandover.id),
          newHandover,
        );
      }
    },
  });
}

export function useDeleteHandover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => handoversApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: handoverKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: handoverKeys.lists() });
    },
  });
}

// --- INSTALLATION QUERIES ---

export function useInstallations() {
  return useQuery({
    queryKey: installationKeys.lists(),
    queryFn: () => installationsApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useInstallation(id: string) {
  return useQuery({
    queryKey: installationKeys.detail(id),
    queryFn: () => installationsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateInstallation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Installation, "id" | "docNumber">) =>
      installationsApi.create(data),
    onSuccess: (newInstallation) => {
      queryClient.invalidateQueries({ queryKey: installationKeys.lists() });
      if (newInstallation) {
        queryClient.setQueryData(
          installationKeys.detail(newInstallation.id),
          newInstallation,
        );
      }
    },
  });
}

export function useDeleteInstallation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => installationsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: installationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: installationKeys.lists() });
    },
  });
}

// --- MAINTENANCE QUERIES ---

export function useMaintenances() {
  return useQuery({
    queryKey: maintenanceKeys.lists(),
    queryFn: () => maintenancesApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMaintenance(id: string) {
  return useQuery({
    queryKey: maintenanceKeys.detail(id),
    queryFn: () => maintenancesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Maintenance, "id" | "docNumber">) =>
      maintenancesApi.create(data),
    onSuccess: (newMaintenance) => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() });
      if (newMaintenance) {
        queryClient.setQueryData(
          maintenanceKeys.detail(newMaintenance.id),
          newMaintenance,
        );
      }
    },
  });
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Maintenance> }) =>
      maintenancesApi.update(id, data),
    onSuccess: (updatedMaintenance, { id }) => {
      queryClient.setQueryData(maintenanceKeys.detail(id), updatedMaintenance);
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() });
    },
  });
}

export function useCompleteMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      completedBy,
      completionDate,
    }: {
      id: string;
      completedBy: string;
      completionDate: string;
    }) => maintenancesApi.complete(id, { completedBy, completionDate }),
    onSuccess: (updatedMaintenance, { id }) => {
      queryClient.setQueryData(maintenanceKeys.detail(id), updatedMaintenance);
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() });
    },
  });
}

export function useDeleteMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => maintenancesApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: maintenanceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() });
    },
  });
}

// --- DISMANTLE QUERIES ---

export function useDismantles() {
  return useQuery({
    queryKey: dismantleKeys.lists(),
    queryFn: () => dismantlesApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDismantle(id: string) {
  return useQuery({
    queryKey: dismantleKeys.detail(id),
    queryFn: () => dismantlesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateDismantle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Dismantle, "id" | "docNumber">) =>
      dismantlesApi.create(data),
    onSuccess: (newDismantle) => {
      queryClient.invalidateQueries({ queryKey: dismantleKeys.lists() });
      if (newDismantle) {
        queryClient.setQueryData(
          dismantleKeys.detail(newDismantle.id),
          newDismantle,
        );
      }
    },
  });
}

export function useUpdateDismantle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Dismantle> }) =>
      dismantlesApi.update(id, data),
    onSuccess: (updatedDismantle, { id }) => {
      queryClient.setQueryData(dismantleKeys.detail(id), updatedDismantle);
      queryClient.invalidateQueries({ queryKey: dismantleKeys.lists() });
    },
  });
}

export function useCompleteDismantle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, acknowledger }: { id: string; acknowledger: string }) =>
      dismantlesApi.complete(id, { acknowledger }),
    onSuccess: (updatedDismantle, { id }) => {
      queryClient.setQueryData(dismantleKeys.detail(id), updatedDismantle);
      queryClient.invalidateQueries({ queryKey: dismantleKeys.lists() });
    },
  });
}

export function useDeleteDismantle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dismantlesApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: dismantleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: dismantleKeys.lists() });
    },
  });
}
