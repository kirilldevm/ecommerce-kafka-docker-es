import { OrderCard } from '@/components/orders/OrderCard';
import { Button } from '@/components/ui/button';
import type { Order } from '@/types/order.types';
import { Loader2, PackageOpen } from 'lucide-react';

interface OrdersListProps {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  onRetry: () => void;
}

export function OrdersList({
  orders,
  isLoading,
  error,
  isAdmin,
  onRetry,
}: OrdersListProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-border bg-background">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading orders...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-6 py-10 text-center">
        <PackageOpen className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {isAdmin ? 'No orders yet.' : 'You have not placed any orders yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} showCustomer={isAdmin} />
      ))}
    </div>
  );
}
