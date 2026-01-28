import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "../types";
import { authApi } from "../services/api/auth.api";
import { useUIStore } from "./useUIStore";
import { ROLE_DEFAULT_PERMISSIONS, sanitizePermissions } from "../utils/permissions";

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
          const cleanUser = {
            ...response.user,
            permissions: sanitizePermissions(response.user.permissions || [], response.user.role),
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
          const standardPermissions = ROLE_DEFAULT_PERMISSIONS[currentUser.role];
          if (standardPermissions) {
            const sanitizedUser = {
              ...currentUser,
              permissions: sanitizePermissions(currentUser.permissions, currentUser.role),
            };
            set({ currentUser: sanitizedUser });
          }
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      /**
       * SECURITY: Partialize - Hanya simpan data yang DIPERLUKAN untuk session
       *
       * Data yang disimpan:
       * - currentUser: User info (id, name, email, role, permissions, mustChangePassword)
       * - token: JWT token untuk API authentication
       *
       * Data yang TIDAK disimpan di localStorage:
       * - Password (tidak pernah ada di frontend)
       * - Sensitive business data
       * - isLoading, error (transient state)
       *
       * JWT token memang perlu disimpan untuk maintain session antar refresh.
       * Ini adalah standar industri untuk SPA authentication.
       * Token sudah di-sign oleh server dan akan expired secara otomatis.
       */
      partialize: (state) => ({
        currentUser: state.currentUser
          ? {
              id: state.currentUser.id,
              name: state.currentUser.name,
              email: state.currentUser.email,
              role: state.currentUser.role,
              divisionId: state.currentUser.divisionId,
              permissions: state.currentUser.permissions,
              mustChangePassword: state.currentUser.mustChangePassword,
              // Tidak menyimpan data sensitif lainnya
            }
          : null,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        state?.checkSession();
      },
    }
  )
);
