/**
 * Stock Query Hooks
 *
 * TanStack Query hooks for stock management operations.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stockApi, StockMovementFilter } from "../../services/api/stock.api";
import type { StockMovement } from "../../types";

// Query keys
export const stockKeys = {
  all: ["stock"] as const,
  movements: () => [...stockKeys.all, "movements"] as const,
  movementsFiltered: (filters: StockMovementFilter) =>
    [...stockKeys.movements(), filters] as const,
  ledger: () => [...stockKeys.all, "ledger"] as const,
  itemHistory: (assetName: string, brand: string) =>
    [...stockKeys.all, "history", assetName, brand] as const,
  availability: (assetName: string, brand: string, quantity: number) =>
    [...stockKeys.all, "availability", assetName, brand, quantity] as const,
};

/**
 * Get stock movements with optional filters
 */
export function useStockMovements(filters?: StockMovementFilter) {
  return useQuery({
    queryKey: stockKeys.movementsFiltered(filters || {}),
    queryFn: () => stockApi.getMovements(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - stock data changes frequently
  });
}

/**
 * Get stock ledger (current balances)
 */
export function useStockLedger() {
  return useQuery({
    queryKey: stockKeys.ledger(),
    queryFn: () => stockApi.getLedger(),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get stock history for specific item
 */
export function useStockItemHistory(assetName: string, brand: string) {
  return useQuery({
    queryKey: stockKeys.itemHistory(assetName, brand),
    queryFn: () => stockApi.getItemHistory(assetName, brand),
    enabled: !!assetName && !!brand,
  });
}

/**
 * Check stock availability
 */
export function useStockAvailability(
  assetName: string,
  brand: string,
  quantity: number,
) {
  return useQuery({
    queryKey: stockKeys.availability(assetName, brand, quantity),
    queryFn: () => stockApi.checkAvailability(assetName, brand, quantity),
    enabled: !!assetName && !!brand && quantity > 0,
  });
}

/**
 * Record a new stock movement
 */
export function useRecordStockMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<StockMovement, "id" | "balanceAfter">) =>
      stockApi.recordMovement(data),
    onSuccess: (newMovement) => {
      // Invalidate all stock-related queries
      queryClient.invalidateQueries({ queryKey: stockKeys.movements() });
      queryClient.invalidateQueries({ queryKey: stockKeys.ledger() });
      queryClient.invalidateQueries({
        queryKey: stockKeys.itemHistory(
          newMovement.assetName,
          newMovement.brand,
        ),
      });
    },
  });
}
