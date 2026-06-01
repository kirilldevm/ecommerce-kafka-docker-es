import { registerAccessTokenGetter } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth/auth.store';
import type { AuthUser } from '@/types/auth.types';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';

interface AuthContextValue {
  user: AuthUser | null;
  isHydrated: boolean;
  isSubmitting: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: ReturnType<typeof useAuthStore.getState>['login'];
  register: ReturnType<typeof useAuthStore.getState>['register'];
  logout: ReturnType<typeof useAuthStore.getState>['logout'];
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isSubmitting = useAuthStore((s) => s.isSubmitting);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);
  const clearError = useAuthStore((s) => s.clearError);
  const refreshSession = useAuthStore((s) => s.refreshSession);
  const accessToken = useAuthStore((s) => s.accessToken);
  const getAccessToken = useAuthStore((s) => s.getAccessToken);
  const isAuthenticated = Boolean(accessToken && user);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    registerAccessTokenGetter(getAccessToken);
  }, [getAccessToken]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (user && !getAccessToken()) {
      void refreshSession();
    }
  }, [getAccessToken, isHydrated, refreshSession, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isHydrated,
      isSubmitting,
      error,
      isAuthenticated,
      isAdmin,
      login,
      register,
      logout,
      clearError,
    }),
    [
      clearError,
      error,
      isAdmin,
      isAuthenticated,
      isHydrated,
      isSubmitting,
      login,
      logout,
      register,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
