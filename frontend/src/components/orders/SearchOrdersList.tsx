import { SearchOrderCard } from '@/components/orders/SearchOrderCard';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  PackageOpen,
  Search as SearchIcon,
} from 'lucide-react';
import type { SearchOrder } from '@/types/search.types';

interface SearchOrdersListProps {
  orders: SearchOrder[];
  isLoading: boolean;
  error: string | null;
  isEmptyMessage?: string;
  onRetry: () => void;
}

export function SearchOrdersList({
  orders,
  isLoading,
  error,
  isEmptyMessage,
  onRetry,
}: SearchOrdersListProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-border bg-background">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Searching orders...
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
          {isEmptyMessage ?? 'No matching orders found.'}
        </p>
        <div className="text-xs text-muted-foreground">
          <SearchIcon className="inline size-3" /> Try changing query or filters.
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {orders.map((order) => (
        <SearchOrderCard key={order.orderId} order={order} />
      ))}
    </div>
  );
}

