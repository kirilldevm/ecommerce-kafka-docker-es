import { OrdersList } from '@/components/orders/OrdersList';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth.context';
import { useOrdersStream } from '@/hooks/useOrdersStream';
import { cn } from '@/lib/utils';
import { useOrdersStore } from '@/stores/orders/orders.store';
import { RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

export function OrdersPage() {
  const { isAdmin } = useAuth();
  const orders = useOrdersStore((state) => state.orders);
  const isLoading = useOrdersStore((state) => state.isLoading);
  const error = useOrdersStore((state) => state.error);
  const isStreamConnected = useOrdersStore((state) => state.isStreamConnected);
  const fetchOrders = useOrdersStore((state) => state.fetchOrders);

  useOrdersStream();

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAdmin
              ? 'All orders across the platform with live status updates.'
              : 'Your orders with real-time status updates.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className={cn(
                'size-2 rounded-full',
                isStreamConnected ? 'bg-emerald-500' : 'bg-muted-foreground/40',
              )}
              aria-hidden
            />
            {isStreamConnected ? 'Live updates' : 'Connecting...'}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => void fetchOrders()}
          >
            <RefreshCw className={cn('size-4', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      <OrdersList
        orders={orders}
        isLoading={isLoading}
        error={error}
        isAdmin={isAdmin}
        onRetry={() => void fetchOrders()}
      />
    </div>
  );
}
