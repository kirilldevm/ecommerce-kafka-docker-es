import { routes } from '@/config/routes.config';
import { useAuth } from '@/context/auth.context';
import { ShopPage } from '@/pages/shop/ShopPage';
import { Navigate } from 'react-router-dom';

export function RoleHomeRedirect() {
  const { isAdmin } = useAuth();

  if (isAdmin) {
    return <Navigate to={routes.orders} replace />;
  }

  return <ShopPage />;
}
