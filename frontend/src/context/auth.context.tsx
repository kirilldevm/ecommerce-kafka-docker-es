import { registerAccessTokenGetter } from '@/lib/api-client';
import { ensureValidSession } from '@/lib/auth-session';
import { isAccessTokenExpired } from '@/lib/jwt';
import { useAuthStore } from '@/stores/auth/auth.store';
import type { AuthUser } from '@/types/auth.types';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface AuthContextValue {
  user: AuthUser | null;
  isHydrated: boolean;
  isSessionReady: boolean;
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
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const getAccessToken = useAuthStore((s) => s.getAccessToken);
  const [isSessionReady, setIsSessionReady] = useState(false);

  const isAuthenticated = Boolean(
    user && refreshToken && accessToken && !isAccessTokenExpired(accessToken),
  );
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    registerAccessTokenGetter(getAccessToken);
  }, [getAccessToken]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!user || !refreshToken) {
      setIsSessionReady(true);
      return;
    }

    let cancelled = false;

    void ensureValidSession().finally(() => {
      if (!cancelled) {
        setIsSessionReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isHydrated, refreshToken, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isHydrated,
      isSessionReady,
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
      isSessionReady,
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
