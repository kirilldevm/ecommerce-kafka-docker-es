import { Navigate, Outlet } from 'react-router-dom';
import { routes } from '@/config/routes.config';
import { useAuth } from '@/context/auth.context';

export function GuestRoute() {
  const { isHydrated, isAuthenticated } = useAuth();

  if (!isHydrated) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={routes.home} replace />;
  }

  return <Outlet />;
}
