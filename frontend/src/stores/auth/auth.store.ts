import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storageKeys } from '@/config/storage.config';
import { getApiErrorMessage } from '@/lib/api-error';
import { authService } from '@/services/auth/auth.service';
import type {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from '@/types/auth.types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  isSubmitting: boolean;
  error: string | null;

  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  getAccessToken: () => string | null;
  clearError: () => void;
  setHydrated: () => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isHydrated: false,
      isSubmitting: false,
      error: null,

      isAuthenticated: () => Boolean(get().accessToken && get().user),
      isAdmin: () => get().user?.role === 'ADMIN',
      getAccessToken: () => get().accessToken,
      clearError: () => set({ error: null }),
      setHydrated: () => set({ isHydrated: true }),

      login: async (credentials) => {
        set({ isSubmitting: true, error: null });
        try {
          const result = await authService.login(credentials);
          set({
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            isSubmitting: false,
          });
        } catch (error) {
          set({
            isSubmitting: false,
            error: getApiErrorMessage(error, 'Login failed'),
          });
          throw error;
        }
      },

      register: async (credentials) => {
        set({ isSubmitting: true, error: null });
        try {
          await authService.register(credentials);
          set({ isSubmitting: false });
        } catch (error) {
          set({
            isSubmitting: false,
            error: getApiErrorMessage(error, 'Registration failed'),
          });
          throw error;
        }
      },

      logout: async () => {
        const refreshToken = get().refreshToken;
        set({ isSubmitting: true, error: null });
        try {
          if (refreshToken) {
            await authService.logout(refreshToken);
          }
        } catch {
          // Clear local session even if server logout fails
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isSubmitting: false,
            error: null,
          });
        }
      },

      refreshSession: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) {
          return false;
        }

        try {
          const result = await authService.refresh(refreshToken);
          set({
            user: result.user,
            accessToken: result.accessToken,
          });
          return true;
        } catch {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
          });
          return false;
        }
      },
    }),
    {
      name: storageKeys.auth,
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
