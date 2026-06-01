import { Navigate, Outlet } from 'react-router-dom';
import { getDefaultRouteForRole } from '@/config/routes.config';
import { useAuth } from '@/context/auth.context';

export function UserRoute() {
  const { isAdmin } = useAuth();

  if (isAdmin) {
    return <Navigate to={getDefaultRouteForRole(true)} replace />;
  }

  return <Outlet />;
}
