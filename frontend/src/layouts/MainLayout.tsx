import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';

export function MainLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-muted/20">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
