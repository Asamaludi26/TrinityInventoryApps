/**
 * Authentication API Service
 */

import { apiClient, USE_MOCK, ApiError } from "./client";
import { User, LoginResponse } from "../../types";

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

const MOCK_LATENCY = 400;
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

export const authApi = {
  /**
   * Login user with email and password
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const users = getFromStorage<User[]>("app_users") || [];
        const user = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase(),
        );
        if (!user) {
          throw new ApiError(
            "Email tidak terdaftar atau kredensial salah.",
            401,
            "AUTH_INVALID_CREDENTIALS",
          );
        }
        // Mock token
        const token = `mock_token_${user.id}_${Date.now()}`;
        return { user, token };
      });
    }

    return apiClient.post<LoginResponse>("/auth/login", { email, password });
  },

  /**
   * Logout - invalidate token on server
   */
  logout: async (): Promise<void> => {
    if (USE_MOCK) {
      return mockDelay(() => undefined);
    }
    return apiClient.post("/auth/logout");
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string): Promise<void> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const users = getFromStorage<User[]>("app_users") || [];
        const userIndex = users.findIndex(
          (u) => u.email.toLowerCase() === email.toLowerCase(),
        );
        if (userIndex !== -1) {
          users[userIndex] = {
            ...users[userIndex],
            passwordResetRequested: true,
            passwordResetRequestDate: new Date().toISOString(),
          };
          saveToStorage("app_users", users);
        }
        // Always return success (don't reveal if email exists)
      });
    }

    return apiClient.post("/auth/forgot-password", { email });
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const authStorage = localStorage.getItem("auth-storage");
        if (!authStorage) {
          throw new ApiError(
            "Tidak terautentikasi.",
            401,
            "AUTH_TOKEN_MISSING",
          );
        }
        const { state } = JSON.parse(authStorage);
        if (!state?.currentUser) {
          throw new ApiError("Sesi tidak valid.", 401, "AUTH_SESSION_EXPIRED");
        }
        return state.currentUser;
      });
    }

    return apiClient.get<User>("/auth/profile");
  },

  /**
   * Update password
   */
  updatePassword: async (
    currentPassword: string,
    newPassword: string,
  ): Promise<void> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        // Mock: just pretend it succeeded
      });
    }

    return apiClient.patch("/auth/password", { currentPassword, newPassword });
  },
};
