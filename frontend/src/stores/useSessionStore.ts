/**
 * Session Store
 *
 * Lightweight store untuk mengelola session-related state.
 * TIDAK menggunakan persist - semua state akan reset saat refresh.
 *
 * Kegunaan:
 * - Track session expired untuk menampilkan modal
 * - Koordinasi antar komponen untuk session events
 * - Real-time notification untuk password reset
 */

import { create } from "zustand";

export type SessionExpiredReason = "token_expired" | "password_reset" | "force_logout" | "unknown";

interface SessionState {
  // Session expired state
  isSessionExpired: boolean;
  sessionExpiredMessage: string | null;
  sessionExpiredReason: SessionExpiredReason;

  // Actions
  setSessionExpired: (message?: string, reason?: SessionExpiredReason) => void;
  clearSessionExpired: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  isSessionExpired: false,
  sessionExpiredMessage: null,
  sessionExpiredReason: "unknown",

  setSessionExpired: (message, reason = "unknown") => {
    set({
      isSessionExpired: true,
      sessionExpiredMessage: message || "Sesi telah berakhir. Silakan login kembali.",
      sessionExpiredReason: reason,
    });
  },

  clearSessionExpired: () => {
    set({
      isSessionExpired: false,
      sessionExpiredMessage: null,
      sessionExpiredReason: "unknown",
    });
  },
}));
