import { Card, CardContent } from '@/components/ui/card';
import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className='relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-muted/40 p-4'>
      <div
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background'
        aria-hidden
      />

      <div className='relative z-10 w-full max-w-md'>
        <div className='mb-6 text-center'>
          <p className='text-xs font-medium tracking-widest text-muted-foreground uppercase'>
            ShopFlow
          </p>
          <h1 className='mt-1 text-2xl font-semibold tracking-tight'>
            E-Commerce
          </h1>
        </div>

        <Card className='px-0'>
          <CardContent className='px-4'>
            <Outlet />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
