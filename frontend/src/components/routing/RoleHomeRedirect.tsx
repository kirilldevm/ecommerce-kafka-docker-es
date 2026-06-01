import { routes } from '@/config/routes.config';
import { useAuth } from '@/context/auth.context';
import { ShopPlaceholderPage } from '@/pages/placeholders/ShopPlaceholderPage';
import { Navigate } from 'react-router-dom';

export function RoleHomeRedirect() {
  const { isAdmin } = useAuth();

  if (isAdmin) {
    return <Navigate to={routes.orders} replace />;
  }

  return <ShopPlaceholderPage />;
}
