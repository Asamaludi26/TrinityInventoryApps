/**
 * Auth Query Hooks
 *
 * TanStack Query hooks for authentication operations.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../services/api/auth.api";
import { useAuthStore } from "../../stores/useAuthStore";

// Login mutation
export function useLogin() {
  const authStoreLogin = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: async (response) => {
      // Store token
      localStorage.setItem("auth_token", response.token);
      // Update auth store - pass email and password
      await authStoreLogin(response.user.email, "mock_password");
    },
  });
}

// Logout mutation
export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      localStorage.removeItem("auth_token");
      logout();
      queryClient.clear();
    },
  });
}

// Request password reset
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => authApi.requestPasswordReset(email),
  });
}

// Update password
export function useUpdatePassword() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => authApi.updatePassword(currentPassword, newPassword),
  });
}
