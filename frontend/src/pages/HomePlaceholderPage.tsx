import { Button } from '@/components/ui/button';
import { routes } from '@/config/routes.config';
import { useAuth } from '@/context/auth.context';
import { Link } from 'react-router-dom';

export function HomePlaceholderPage() {
  const { user, isAdmin, logout, isSubmitting } = useAuth();

  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-4 p-6'>
      <div className='max-w-md text-center'>
        <h1 className='text-2xl font-semibold'>You are signed in</h1>
        <p className='mt-2 text-sm text-muted-foreground'>
          {user?.email} · {isAdmin ? 'Admin' : 'User'}
        </p>
        <p className='mt-4 text-sm text-muted-foreground'>
          Shop and dashboard pages come next. Auth flow is wired to the API
          gateway.
        </p>
      </div>
      <div className='flex gap-2'>
        <Button
          variant='outline'
          onClick={() => void logout()}
          disabled={isSubmitting}
        >
          Sign out
        </Button>
        <Link
          to={routes.login}
          className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted"
        >
          Auth pages
        </Link>
      </div>
    </div>
  );
}
