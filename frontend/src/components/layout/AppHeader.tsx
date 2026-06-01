import { AppNav } from '@/components/layout/AppNav';
import { Button } from '@/components/ui/button';
import { routes } from '@/config/routes.config';
import { useAuth } from '@/context/auth.context';
import { LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function AppHeader() {
  const navigate = useNavigate();
  const { user, isAdmin, logout, isSubmitting } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate(routes.login, { replace: true });
  };

  return (
    <header className='sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80'>
      <div className='mx-auto flex max-w-6xl flex-col gap-4 px-6 py-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-6'>
          <Link to={isAdmin ? routes.orders : routes.home} className='shrink-0'>
            <span className='text-xs font-medium tracking-widest text-muted-foreground uppercase'>
              ShopFlow
            </span>
            <span className='block text-lg font-semibold leading-tight'>
              E-Commerce
            </span>
          </Link>
          <AppNav />
        </div>

        <div className='flex items-center gap-5 sm:shrink-0'>
          <div className='hidden text-right text-sm sm:block'>
            <p className='font-medium leading-none'>{user?.email}</p>
            <p className='mt-1 text-xs text-muted-foreground'>
              {isAdmin ? 'Administrator' : 'Customer'}
            </p>
          </div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={isSubmitting}
            onClick={() => void handleLogout()}
          >
            <LogOut className='size-4' />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
