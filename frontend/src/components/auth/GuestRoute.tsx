import { Navigate, Outlet } from 'react-router-dom';
import { getDefaultRouteForRole } from '@/config/routes.config';
import { useAuth } from '@/context/auth.context';

export function GuestRoute() {
  const { isHydrated, isAuthenticated, isAdmin } = useAuth();

  if (!isHydrated) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getDefaultRouteForRole(isAdmin)} replace />;
  }

  return <Outlet />;
}
