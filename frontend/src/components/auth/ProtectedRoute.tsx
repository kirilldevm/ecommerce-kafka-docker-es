import { Navigate, Outlet } from 'react-router-dom';
import { routes } from '@/config/routes.config';
import { useAuth } from '@/context/auth.context';

export function ProtectedRoute() {
  const { isHydrated, isSessionReady, isAuthenticated } = useAuth();

  if (!isHydrated || !isSessionReady) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={routes.login} replace />;
  }

  return <Outlet />;
}
