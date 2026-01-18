/**
 * Request Query Hooks
 *
 * TanStack Query hooks for purchase requests, loan requests, and returns.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  requestsApi,
  RequestFilters,
  ApproveRequestPayload,
} from "../../services/api/requests.api";
import {
  loansApi,
  LoanFilters,
  ApproveLoanPayload,
  ReturnItem,
  returnsApi,
} from "../../services/api/loans.api";
import type { Request, LoanRequest, PurchaseDetails } from "../../types";

// Query keys
export const requestKeys = {
  all: ["requests"] as const,
  lists: () => [...requestKeys.all, "list"] as const,
  list: (filters: RequestFilters) => [...requestKeys.lists(), filters] as const,
  detail: (id: string) => [...requestKeys.all, "detail", id] as const,
};

export const loanKeys = {
  all: ["loans"] as const,
  lists: () => [...loanKeys.all, "list"] as const,
  list: (filters: LoanFilters) => [...loanKeys.lists(), filters] as const,
  detail: (id: string) => [...loanKeys.all, "detail", id] as const,
};

export const returnKeys = {
  all: ["returns"] as const,
  lists: () => [...returnKeys.all, "list"] as const,
  detail: (id: string) => [...returnKeys.all, "detail", id] as const,
};

// --- PURCHASE REQUESTS ---

export function useRequests(filters?: RequestFilters) {
  return useQuery({
    queryKey: requestKeys.list(filters || {}),
    queryFn: () => requestsApi.getAll(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRequest(id: string) {
  return useQuery({
    queryKey: requestKeys.detail(id),
    queryFn: () => requestsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Request, "id" | "docNumber" | "status">) =>
      requestsApi.create(data),
    onSuccess: (newRequest) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
      if (newRequest) {
        queryClient.setQueryData(requestKeys.detail(newRequest.id), newRequest);
      }
    },
  });
}

export function useUpdateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Request> }) =>
      requestsApi.update(id, data),
    onSuccess: (updatedRequest, { id }) => {
      queryClient.setQueryData(requestKeys.detail(id), updatedRequest);
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
    },
  });
}

export function useApproveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ApproveRequestPayload;
    }) => requestsApi.approve(id, payload),
    onSuccess: (updatedRequest, { id }) => {
      queryClient.setQueryData(requestKeys.detail(id), updatedRequest);
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
    },
  });
}

export function useRejectRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      rejectedBy,
      rejectionReason,
    }: {
      id: string;
      rejectedBy: string;
      rejectionReason: string;
    }) => requestsApi.reject(id, { rejectedBy, rejectionReason }),
    onSuccess: (updatedRequest, { id }) => {
      queryClient.setQueryData(requestKeys.detail(id), updatedRequest);
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
    },
  });
}

export function useCancelRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestsApi.cancel(id),
    onSuccess: (updatedRequest, id) => {
      queryClient.setQueryData(requestKeys.detail(id), updatedRequest);
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
    },
  });
}

export function useFillPurchaseDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      itemId,
      details,
    }: {
      id: string;
      itemId: number;
      details: PurchaseDetails;
    }) => requestsApi.fillPurchaseDetails(id, itemId, details),
    onSuccess: (updatedRequest, { id }) => {
      queryClient.setQueryData(requestKeys.detail(id), updatedRequest);
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
    },
  });
}

export function useDeleteRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: requestKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
    },
  });
}

// --- LOAN REQUESTS ---

export function useLoanRequests(filters?: LoanFilters) {
  return useQuery({
    queryKey: loanKeys.list(filters || {}),
    queryFn: () => loansApi.getAll(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLoanRequest(id: string) {
  return useQuery({
    queryKey: loanKeys.detail(id),
    queryFn: () => loansApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateLoanRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<LoanRequest, "id" | "status">) =>
      loansApi.create(data),
    onSuccess: (newLoan) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      if (newLoan) {
        queryClient.setQueryData(loanKeys.detail(newLoan.id), newLoan);
      }
    },
  });
}

export function useApproveLoanRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ApproveLoanPayload;
    }) => loansApi.approve(id, payload),
    onSuccess: (updatedLoan, { id }) => {
      queryClient.setQueryData(loanKeys.detail(id), updatedLoan);
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
    },
  });
}

export function useRejectLoanRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      rejectionReason,
    }: {
      id: string;
      rejectionReason: string;
    }) => loansApi.reject(id, { rejectionReason }),
    onSuccess: (updatedLoan, { id }) => {
      queryClient.setQueryData(loanKeys.detail(id), updatedLoan);
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
    },
  });
}

export function useDeleteLoanRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => loansApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: loanKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
    },
  });
}

// --- RETURNS ---

export function useReturns() {
  return useQuery({
    queryKey: returnKeys.lists(),
    queryFn: () => returnsApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useReturn(id: string) {
  return useQuery({
    queryKey: returnKeys.detail(id),
    queryFn: () => returnsApi.getById(id),
    enabled: !!id,
  });
}

export function useSubmitReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ loanId, items }: { loanId: string; items: ReturnItem[] }) =>
      loansApi.submitReturn(loanId, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: returnKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
    },
  });
}

export function useVerifyReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      returnId,
      acceptedAssetIds,
      verifiedBy,
    }: {
      returnId: string;
      acceptedAssetIds: string[];
      verifiedBy: string;
    }) => returnsApi.verify(returnId, acceptedAssetIds, verifiedBy),
    onSuccess: (updatedReturn, { returnId }) => {
      queryClient.setQueryData(returnKeys.detail(returnId), updatedReturn);
      queryClient.invalidateQueries({ queryKey: returnKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
    },
  });
}
