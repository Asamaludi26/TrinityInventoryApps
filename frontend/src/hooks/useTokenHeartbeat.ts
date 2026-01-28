/**
 * Token Heartbeat Hook
 *
 * Real-time token validation untuk SaaS profesional.
 * Melakukan pengecekan berkala terhadap validitas token untuk memastikan
 * user yang tokennya sudah di-invalidate (misal karena admin reset password)
 * langsung diarahkan ke login.
 *
 * Fitur:
 * - Periodic validation (default: 30 detik)
 * - Exponential backoff saat error jaringan
 * - Pause saat tab tidak aktif (visibility API)
 * - Auto-resume saat tab aktif kembali
 */

import { useEffect, useRef, useCallback } from "react";
import { authApi } from "../services/api/auth.api";
import { useSessionStore, SessionExpiredReason } from "../stores/useSessionStore";
import { useAuthStore } from "../stores/useAuthStore";

interface HeartbeatOptions {
  /** Interval pengecekan dalam milidetik (default: 30000 = 30 detik) */
  intervalMs?: number;
  /** Aktifkan heartbeat (default: true) */
  enabled?: boolean;
}

/**
 * Hook untuk real-time token validation
 *
 * @example
 * ```tsx
 * // Di App.tsx atau komponen root yang memerlukan auth
 * useTokenHeartbeat({ intervalMs: 30000, enabled: !!currentUser });
 * ```
 */
export function useTokenHeartbeat(options: HeartbeatOptions = {}) {
  const { intervalMs = 30000, enabled = true } = options;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const setSessionExpired = useSessionStore((state) => state.setSessionExpired);
  const token = useAuthStore((state) => state.token);
  const updateCurrentUser = useAuthStore((state) => state.updateCurrentUser);

  /**
   * Melakukan validasi token ke server
   */
  const validateToken = useCallback(async () => {
    if (!token) return;

    try {
      const result = await authApi.verifyToken();

      if (!result.valid) {
        // Token invalid - trigger session expired dengan reason password_reset
        // karena jika token invalid tapi bukan 401, kemungkinan besar karena tokenVersion berubah
        setSessionExpired(
          "Password akun Anda telah direset oleh administrator. Silakan login kembali dengan password baru.",
          "password_reset"
        );
        return;
      }

      // Token valid - sync user data jika ada perubahan (real-time update)
      if (result.user) {
        updateCurrentUser(result.user);
      }

      // Reset retry count on success
      retryCountRef.current = 0;
    } catch (error: any) {
      // 401 error already handled by client.ts interceptor
      if (error?.status === 401) {
        return; // Session expired modal will be shown by interceptor
      }

      // Network error - use exponential backoff
      retryCountRef.current++;

      if (retryCountRef.current >= maxRetries) {
        console.warn("[Heartbeat] Max retries reached, will retry on next interval");
        retryCountRef.current = 0;
      }
    }
  }, [token, setSessionExpired, updateCurrentUser]);

  /**
   * Memulai interval heartbeat
   */
  const startHeartbeat = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Immediate check on start
    validateToken();

    // Setup interval
    intervalRef.current = setInterval(validateToken, intervalMs);
  }, [validateToken, intervalMs]);

  /**
   * Menghentikan interval heartbeat
   */
  const stopHeartbeat = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Effect untuk mengelola lifecycle heartbeat
  useEffect(() => {
    if (!enabled || !token) {
      stopHeartbeat();
      return;
    }

    startHeartbeat();

    // Visibility API - pause saat tab tidak aktif untuk hemat resource
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopHeartbeat();
      } else {
        // Tab aktif kembali - langsung validasi dan mulai interval
        startHeartbeat();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopHeartbeat();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, token, startHeartbeat, stopHeartbeat]);

  // Return control functions jika diperlukan
  return {
    validateNow: validateToken,
    pause: stopHeartbeat,
    resume: startHeartbeat,
  };
}
