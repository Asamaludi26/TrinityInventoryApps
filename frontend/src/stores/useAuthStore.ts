import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "../types";
import { authApi } from "../services/api/auth.api";
import { useUIStore } from "./useUIStore";
import {
  ROLE_DEFAULT_PERMISSIONS,
  sanitizePermissions,
} from "../utils/permissions";

interface AuthState {
  currentUser: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, pass: string) => Promise<User>;
  requestPasswordReset: (email: string) => Promise<void>;
  logout: () => void;
  updateCurrentUser: (user: User) => void;
  checkSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, pass) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, pass);

          // SECURITY: Ensure permissions are sanitized/enforced based on role definitions
          // This prevents potential backend/data drift or storage tampering
          const cleanUser = {
            ...response.user,
            permissions: sanitizePermissions(
              response.user.permissions || [],
              response.user.role,
            ),
          };

          set({
            currentUser: cleanUser,
            token: response.token,
            isLoading: false,
          });
          return cleanUser;
        } catch (err: any) {
          set({ error: err.message || "Login failed", isLoading: false });
          throw err;
        }
      },

      requestPasswordReset: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.requestPasswordReset(email);
          set({ isLoading: false });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      logout: () => {
        set({ currentUser: null, token: null });
        localStorage.removeItem("auth-storage");
        useUIStore.getState().resetUIState();
      },

      updateCurrentUser: (user) => {
        set({ currentUser: user });
      },

      checkSession: () => {
        const { currentUser } = get();
        if (currentUser) {
          // SECURITY HARDENING: Anti-Tamper Check
          // Jika user memodifikasi role/permissions di localStorage,
          // kita reset permissions berdasarkan Role standar sistem.
          const standardPermissions =
            ROLE_DEFAULT_PERMISSIONS[currentUser.role];

          // Simple integrity check (length check is a basic heuristic, in real app verify JWT signature)
          // Disini kita memaksa re-apply permission standar untuk keamanan prototype.
          if (standardPermissions) {
            const sanitizedUser = {
              ...currentUser,
              permissions: sanitizePermissions(
                currentUser.permissions,
                currentUser.role,
              ),
            };
            // Update state diam-diam untuk memperbaiki permission yang mungkin rusak/diubah
            set({ currentUser: sanitizedUser });
          }
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        // Auto-check session integrity upon hydration
        state?.checkSession();
      },
    },
  ),
);
