import { isAccessTokenExpired } from '@/lib/jwt';
import { useAuthStore } from '@/stores/auth/auth.store';

let refreshInFlight: Promise<boolean> | null = null;

export async function ensureValidSession(): Promise<boolean> {
  const { user, accessToken, refreshToken, refreshSession } = useAuthStore.getState();

  if (!user || !refreshToken) {
    return false;
  }

  if (accessToken && !isAccessTokenExpired(accessToken)) {
    return true;
  }

  if (!refreshInFlight) {
    refreshInFlight = refreshSession().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

export function clearRefreshInFlight(): void {
  refreshInFlight = null;
}
