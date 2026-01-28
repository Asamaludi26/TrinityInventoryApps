/**
 * Authentication API Service
 * Pure API calls - no mock logic
 */

import { apiClient, ApiError } from "./client";
import { User, LoginResponse } from "../../types";
import { transformBackendUser } from "../../utils/enumMapper";

export interface BackendLoginResponse {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    division?: string;
    permissions: string[];
    mustChangePassword?: boolean;
  };
  token: string;
}

export const authApi = {
  /**
   * Login user with email and password
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<BackendLoginResponse>("/auth/login", {
      email,
      password,
    });

    return {
      user: transformBackendUser(response.user),
      token: response.token,
    };
  },

  /**
   * Logout - invalidate token on server
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignore logout errors - token may already be invalid
    }
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string): Promise<void> => {
    await apiClient.post("/auth/request-password-reset", { email });
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<any>("/auth/me");
    return transformBackendUser(response);
  },

  /**
   * Verify token validity
   */
  verifyToken: async (): Promise<{ valid: boolean; user: User }> => {
    const response = await apiClient.post<{ valid: boolean; user: any }>("/auth/verify");
    return {
      valid: response.valid,
      user: transformBackendUser(response.user),
    };
  },

  /**
   * Update password
   */
  updatePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.patch("/auth/password", { currentPassword, newPassword });
  },
};
