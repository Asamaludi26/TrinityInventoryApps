/**
 * API Client with Interceptors
 * Centralized fetch wrapper for all API calls
 *
 * NOTE: Mock mode has been deprecated. All API calls now go to the real backend.
 *
 * Security Notes:
 * - Token diambil dari localStorage hanya untuk header Authorization
 * - Tidak menyimpan data sensitif tambahan
 * - Session expired handling melalui global store (bukan alert)
 */

// Helper untuk lazy load stores secara async guna menghindari circular dependency
const getNotifier = async () => {
  const { useNotificationStore } = await import("../../stores/useNotificationStore");
  return useNotificationStore.getState();
};

const getSessionStore = async () => {
  const { useSessionStore } = await import("../../stores/useSessionStore");
  return useSessionStore.getState();
};

// --- CONFIGURATION ---
const getEnv = (): Record<string, string> => {
  try {
    // Casting aman melalui unknown
    return (import.meta as unknown as { env: Record<string, string> }).env || {};
  } catch {
    return {};
  }
};

const env = getEnv();

// DEPRECATED: Mock mode is no longer supported - always use real API
export const USE_MOCK = false;
export const API_URL = env.VITE_API_URL || "http://localhost:3001/api/v1";

// --- ERROR CLASS ---
export class ApiError extends Error {
  status: number;
  code?: string;
  details?: Record<string, unknown>;

  constructor(message: string, status: number, code?: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Interface untuk struktur respons standar backend
interface StandardResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Interface untuk respons paginasi
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  skip: number;
  take: number;
}

// --- API CLIENT ---
class ApiClient {
  private getAuthToken(): string | null {
    try {
      const authStorage = localStorage.getItem("auth-storage");
      if (!authStorage) return null;
      const parsed = JSON.parse(authStorage);
      // Support both old and new token storage formats
      return parsed?.state?.token || parsed?.state?.currentUser?.token || null;
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

      const rawData = await response.json();

      // Handle standard API response wrapper { success: boolean, data: T }
      let data = rawData;
      if (rawData && typeof rawData === "object" && "success" in rawData && "data" in rawData) {
        const stdResponse = rawData as StandardResponse<T>;
        data = stdResponse.data;
      }

      // Handle paginated responses - extract data array if present
      if (
        data &&
        typeof data === "object" &&
        "data" in data &&
        Array.isArray((data as PaginatedResponse<unknown>).data)
      ) {
        const paginated = data as PaginatedResponse<unknown>;
        // Keep pagination info accessible on the array (using type intersection for safety)
        const result = paginated.data as unknown as T & {
          _pagination: { total: number; skip: number; take: number };
        };

        // Inject pagination metadata (Frontend trick)
        (result as any)._pagination = {
          total: paginated.total,
          skip: paginated.skip,
          take: paginated.take,
        };

        return result;
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // Network error
      const message = "Koneksi jaringan bermasalah. Periksa internet Anda.";
      try {
        const notifier = await getNotifier();
        notifier.addToast(message, "error");
      } catch {
        console.error("[ApiClient] Network error:", message);
      }
      throw new ApiError(message, 0, "NETWORK_ERROR");
    }
  }

  private async handleError(response: Response): Promise<never> {
    let errorData: Record<string, unknown> = {};

    try {
      errorData = (await response.json()) as Record<string, unknown>;
    } catch {
      // Response is not JSON
    }

    const message =
      (errorData.message as string) || response.statusText || "Terjadi kesalahan pada server.";
    const code = (errorData.code as string) || `HTTP_${response.status}`;
    const details = errorData.details as Record<string, unknown> | undefined;

    // Handle 401 Unauthorized - Token invalid/expired
    if (response.status === 401) {
      // PENTING: Trigger session expired modal DULU sebelum clear storage
      // Agar modal sempat muncul sebelum state reset
      try {
        const sessionStore = await getSessionStore();
        const errMessage = message || "Sesi telah berakhir. Silakan login ulang.";
        // Jika pesan mengandung kata "password" atau "keamanan", kemungkinan karena password reset
        const isPasswordReset =
          errMessage.toLowerCase().includes("password") ||
          errMessage.toLowerCase().includes("keamanan") ||
          errMessage.toLowerCase().includes("security") ||
          errMessage.toLowerCase().includes("reset");

        console.log("[ApiClient] 401 Detected - Triggering session expired modal", {
          errMessage,
          isPasswordReset,
        });
        sessionStore.setSessionExpired(
          errMessage,
          isPasswordReset ? "password_reset" : "token_expired"
        );
      } catch (e) {
        console.error("[ApiClient] Failed to trigger session modal:", e);
        // Fallback: Force reload jika store tidak tersedia
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }

      // JANGAN hapus storage di sini - biarkan modal handler yang melakukannya
      // Storage akan dihapus saat user klik tombol di modal

      throw new ApiError("Sesi berakhir. Silakan login kembali.", 401, "AUTH_SESSION_EXPIRED");
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      try {
        const notifier = await getNotifier();
        notifier.addToast("Anda tidak memiliki izin untuk aksi ini.", "error");
      } catch {
        console.error("[ApiClient] 403 Forbidden");
      }
      throw new ApiError("Akses ditolak.", 403, "AUTH_FORBIDDEN", details);
    }

    // Handle validation errors (400, 422)
    if (response.status === 400 || response.status === 422) {
      throw new ApiError(message, response.status, code, details);
    }

    // Handle conflict (409)
    if (response.status === 409) {
      throw new ApiError(message, 409, "CONFLICT", details);
    }

    // Handle server errors (5xx)
    if (response.status >= 500) {
      try {
        const notifier = await getNotifier();
        notifier.addToast("Terjadi kesalahan server. Coba lagi nanti.", "error");
      } catch {
        console.error("[ApiClient] Server error");
      }
      throw new ApiError("Server error.", response.status, "SERVER_ERROR");
    }

    throw new ApiError(message, response.status, code, details);
  }

  // Convenience methods
  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: unknown): Promise<T> {
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
