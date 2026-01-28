/**
 * Smart Data Refresh Hook
 *
 * Optimasi performa untuk aplikasi SaaS real-time.
 * Menangani refresh data secara cerdas tanpa full page reload.
 *
 * Fitur:
 * - Visibility-based refresh: Refresh saat tab aktif kembali
 * - Focus-based refresh: Refresh saat window mendapat fokus
 * - Stale-while-revalidate: Tampilkan data lama sambil fetch baru
 * - Debounced refresh: Mencegah refresh berlebihan
 */

import { useEffect, useRef, useCallback } from "react";

interface SmartRefreshOptions {
  /** Callback untuk refresh data */
  onRefresh: () => Promise<void> | void;
  /** Aktifkan refresh saat tab visible (default: true) */
  refreshOnVisible?: boolean;
  /** Aktifkan refresh saat window focus (default: true) */
  refreshOnFocus?: boolean;
  /** Minimum interval antar refresh dalam ms (default: 5000) */
  minRefreshInterval?: number;
  /** Aktifkan fitur ini (default: true) */
  enabled?: boolean;
}

/**
 * Hook untuk smart data refresh
 *
 * @example
 * ```tsx
 * useSmartRefresh({
 *   onRefresh: async () => {
 *     await fetchAssets();
 *     await fetchNotifications();
 *   },
 *   minRefreshInterval: 5000,
 * });
 * ```
 */
export function useSmartRefresh(options: SmartRefreshOptions) {
  const {
    onRefresh,
    refreshOnVisible = true,
    refreshOnFocus = true,
    minRefreshInterval = 5000,
    enabled = true,
  } = options;

  const lastRefreshRef = useRef<number>(Date.now());
  const isRefreshingRef = useRef<boolean>(false);

  /**
   * Melakukan refresh dengan debounce protection
   */
  const doRefresh = useCallback(async () => {
    if (!enabled) return;

    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshRef.current;

    // Skip jika masih dalam interval minimum atau sedang refresh
    if (timeSinceLastRefresh < minRefreshInterval || isRefreshingRef.current) {
      return;
    }

    isRefreshingRef.current = true;
    lastRefreshRef.current = now;

    try {
      await onRefresh();
    } catch (error) {
      console.warn("[SmartRefresh] Refresh failed:", error);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [enabled, minRefreshInterval, onRefresh]);

  // Effect untuk visibility change
  useEffect(() => {
    if (!enabled || !refreshOnVisible) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab menjadi visible - refresh data
        doRefresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [enabled, refreshOnVisible, doRefresh]);

  // Effect untuk window focus
  useEffect(() => {
    if (!enabled || !refreshOnFocus) return;

    const handleFocus = () => {
      doRefresh();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [enabled, refreshOnFocus, doRefresh]);

  return {
    refreshNow: doRefresh,
    isRefreshing: isRefreshingRef.current,
  };
}

/**
 * Hook untuk periodic background refresh
 *
 * @example
 * ```tsx
 * usePeriodicRefresh({
 *   onRefresh: fetchNotifications,
 *   intervalMs: 60000, // 1 menit
 * });
 * ```
 */
interface PeriodicRefreshOptions {
  onRefresh: () => Promise<void> | void;
  intervalMs: number;
  enabled?: boolean;
  pauseWhenHidden?: boolean;
}

export function usePeriodicRefresh(options: PeriodicRefreshOptions) {
  const { onRefresh, intervalMs, enabled = true, pauseWhenHidden = true } = options;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(onRefresh, intervalMs);
  }, [onRefresh, intervalMs]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      stopInterval();
      return;
    }

    startInterval();

    if (pauseWhenHidden) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          stopInterval();
        } else {
          // Langsung refresh saat visible, lalu mulai interval
          onRefresh();
          startInterval();
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
        stopInterval();
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }

    return stopInterval;
  }, [enabled, pauseWhenHidden, startInterval, stopInterval, onRefresh]);

  return { pause: stopInterval, resume: startInterval };
}
