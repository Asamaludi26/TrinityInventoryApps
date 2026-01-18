/**
 * Asset Query Hooks
 *
 * TanStack Query hooks for asset operations.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  assetsApi,
  AssetFilters,
  ConsumeMaterial,
  ConsumeContext,
} from "../../services/api/assets.api";
import type { Asset } from "../../types";

// Query keys
export const assetKeys = {
  all: ["assets"] as const,
  lists: () => [...assetKeys.all, "list"] as const,
  list: (filters: AssetFilters) => [...assetKeys.lists(), filters] as const,
  detail: (id: string) => [...assetKeys.all, "detail", id] as const,
};

// Get all assets
export function useAssets(filters?: AssetFilters) {
  return useQuery({
    queryKey: assetKeys.list(filters || {}),
    queryFn: () => assetsApi.getAll(filters),
    staleTime: 5 * 60 * 1000,
  });
}

// Get single asset
export function useAsset(id: string) {
  return useQuery({
    queryKey: assetKeys.detail(id),
    queryFn: () => assetsApi.getById(id),
    enabled: !!id,
  });
}

// Create asset
export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Asset, "activityLog">) => assetsApi.create(data),
    onSuccess: (newAsset) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
      if (newAsset) {
        queryClient.setQueryData(assetKeys.detail(newAsset.id), newAsset);
      }
    },
  });
}

// Update asset
export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Asset> }) =>
      assetsApi.update(id, data),
    onSuccess: (updatedAsset, { id }) => {
      queryClient.setQueryData(assetKeys.detail(id), updatedAsset);
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
    },
  });
}

// Batch update assets
export function useBatchUpdateAssets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ids,
      data,
      referenceId,
    }: {
      ids: string[];
      data: Partial<Asset>;
      referenceId?: string;
    }) => assetsApi.updateBatch(ids, data, referenceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
    },
  });
}

// Delete asset
export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => assetsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: assetKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
    },
  });
}

// Consume materials
export function useConsumeMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      materials,
      context,
    }: {
      materials: ConsumeMaterial[];
      context: ConsumeContext;
    }) => assetsApi.consume(materials, context),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
    },
  });
}
