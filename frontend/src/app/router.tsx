import { createBrowserRouter, Navigate } from 'react-router-dom';
import { GuestRoute } from '@/components/auth/GuestRoute';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminRoute } from '@/components/routing/AdminRoute';
import { RoleHomeRedirect } from '@/components/routing/RoleHomeRedirect';
import { UserRoute } from '@/components/routing/UserRoute';
import { routes } from '@/config/routes.config';
import { AuthLayout } from '@/layouts/AuthLayout';
import { MainLayout } from '@/layouts/MainLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { AdminProductsPlaceholderPage } from '@/pages/placeholders/AdminProductsPlaceholderPage';
import { AnalyticsPlaceholderPage } from '@/pages/placeholders/AnalyticsPlaceholderPage';
import { OrdersPlaceholderPage } from '@/pages/placeholders/OrdersPlaceholderPage';
import { ProductSearchPlaceholderPage } from '@/pages/placeholders/ProductSearchPlaceholderPage';
import { SearchOrdersPlaceholderPage } from '@/pages/placeholders/SearchOrdersPlaceholderPage';

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <RoleHomeRedirect /> },
          { path: routes.orders.slice(1), element: <OrdersPlaceholderPage /> },
          {
            element: <UserRoute />,
            children: [
              {
                path: routes.productSearch.slice(1),
                element: <ProductSearchPlaceholderPage />,
              },
            ],
          },
          {
            element: <AdminRoute />,
            children: [
              {
                path: routes.analytics.slice(1),
                element: <AnalyticsPlaceholderPage />,
              },
              {
                path: routes.searchOrders.slice(1),
                element: <SearchOrdersPlaceholderPage />,
              },
              {
                path: routes.adminProducts.slice(1),
                element: <AdminProductsPlaceholderPage />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: routes.login.slice(1), element: <LoginPage /> },
          { path: routes.register.slice(1), element: <RegisterPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={routes.login} replace />,
  },
]);
