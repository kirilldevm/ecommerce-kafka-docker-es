import { createBrowserRouter, Navigate } from 'react-router-dom';
import { GuestRoute } from '@/components/auth/GuestRoute';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { routes } from '@/config/routes.config';
import { AuthLayout } from '@/layouts/AuthLayout';
import { HomePlaceholderPage } from '@/pages/HomePlaceholderPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: routes.home,
        element: <HomePlaceholderPage />,
      },
    ],
  },
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: routes.login, element: <LoginPage /> },
          { path: routes.register, element: <RegisterPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={routes.login} replace />,
  },
]);
