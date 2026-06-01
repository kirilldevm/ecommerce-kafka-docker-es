import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/context/auth.context';
import { router } from '@/app/router';

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
