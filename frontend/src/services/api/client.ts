/**
 * API Client with Interceptors
 * Centralized fetch wrapper for all API calls
 */

import { useAuthStore } from "../../stores/useAuthStore";
import { useNotificationStore } from "../../stores/useNotificationStore";

// --- CONFIGURATION ---
const getEnv = () => {
  try {
    return (import.meta as any).env || {};
  } catch {
    return {};
  }
};

const env = getEnv();
export const USE_MOCK = env.VITE_USE_MOCK !== "false";
export const API_URL = env.VITE_API_URL || "http://localhost:3001/api";

// --- ERROR CLASS ---
export class ApiError extends Error {
  status: number;
  code?: string;
  details?: Record<string, any>;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: Record<string, any>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// --- API CLIENT ---
class ApiClient {
  private getAuthToken(): string | null {
    try {
      const authStorage = localStorage.getItem("auth-storage");
      if (!authStorage) return null;
      const parsed = JSON.parse(authStorage);
      return parsed?.state?.currentUser?.token || null;
    } catch {
      return null;
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAuthToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // Network error
      const message = "Koneksi jaringan bermasalah. Periksa internet Anda.";
      useNotificationStore.getState().addToast(message, "error");
      throw new ApiError(message, 0, "NETWORK_ERROR");
    }
  }

  private async handleError(response: Response): Promise<never> {
    let errorData: any = {};

    try {
      errorData = await response.json();
    } catch {
      // Response is not JSON
    }

    const message =
      errorData.message ||
      response.statusText ||
      "Terjadi kesalahan pada server.";
    const code = errorData.code || `HTTP_${response.status}`;

    // Handle 401 Unauthorized - Global redirect
    if (response.status === 401) {
      useAuthStore.getState().logout();
      // Don't throw, just redirect
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new ApiError(
        "Sesi berakhir. Silakan login kembali.",
        401,
        "AUTH_SESSION_EXPIRED",
      );
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      useNotificationStore
        .getState()
        .addToast("Anda tidak memiliki izin untuk aksi ini.", "error");
      throw new ApiError(
        "Akses ditolak.",
        403,
        "AUTH_FORBIDDEN",
        errorData.details,
      );
    }

    // Handle validation errors (400, 422)
    if (response.status === 400 || response.status === 422) {
      throw new ApiError(message, response.status, code, errorData.details);
    }

    // Handle conflict (409)
    if (response.status === 409) {
      throw new ApiError(message, 409, "CONFLICT", errorData.details);
    }

    // Handle server errors (5xx)
    if (response.status >= 500) {
      useNotificationStore
        .getState()
        .addToast("Terjadi kesalahan server. Coba lagi nanti.", "error");
      throw new ApiError("Server error.", response.status, "SERVER_ERROR");
    }

    throw new ApiError(message, response.status, code, errorData.details);
  }

  // Convenience methods
  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
