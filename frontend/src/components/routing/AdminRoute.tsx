import { Navigate, Outlet } from 'react-router-dom';
import { getDefaultRouteForRole } from '@/config/routes.config';
import { useAuth } from '@/context/auth.context';

export function AdminRoute() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to={getDefaultRouteForRole(false)} replace />;
  }

  return <Outlet />;
}
