import { SearchOrdersList } from '@/components/orders/SearchOrdersList';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { orderStatusConfig } from '@/config/order-status.config';
import { searchService } from '@/services/search/search.service';
import { useEffect, useMemo, useState } from 'react';
import type { OrderStatus } from '@/types/order.types';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SearchOrder } from '@/types/search.types';

const limit = 10;
const debounceMs = 400;

export function SearchOrdersPage() {
  const statusOptions = useMemo(() => {
    return Object.entries(orderStatusConfig).map(([status, meta]) => ({
      status: status as OrderStatus,
      label: meta.label,
    }));
  }, []);

  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');

  const [status, setStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<SearchOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q.trim());
      setPage(1);
    }, debounceMs);

    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await searchService.searchOrders({
          q: debouncedQ ? debouncedQ : undefined,
          status: status === 'ALL' ? undefined : status,
          page,
          limit,
        });
        setItems(response.items);
        setTotal(response.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search orders');
      } finally {
        setIsLoading(false);
      }
    };

    void run();
  }, [debouncedQ, page, status]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleSearchNow = () => {
    setDebouncedQ(q.trim());
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Search orders</h1>
        <p className="text-sm text-muted-foreground">
          Elasticsearch search over order id, product names, and status.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-3 md:items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Query</label>
              <Input
                value={q}
                placeholder="e.g. order id or product name"
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                className={cn(
                  'h-8 w-full rounded-lg border border-input bg-background px-2 text-sm',
                )}
                aria-label="Order status"
                value={status}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'ALL') {
                    setStatus('ALL');
                    setPage(1);
                    return;
                  }
                  setStatus(value as OrderStatus);
                  setPage(1);
                }}
              >
                <option value="ALL">All</option>
                {statusOptions.map((opt) => (
                  <option key={opt.status} value={opt.status}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 md:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={handleSearchNow}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                Search
              </Button>
              <div className="text-xs text-muted-foreground">
                {total ? `${total} result${total === 1 ? '' : 's'}` : 'No results yet'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <SearchOrdersList
        orders={items}
        isLoading={isLoading}
        error={error}
        isEmptyMessage={
          q || status !== 'ALL'
            ? 'No matching orders for your search.'
            : 'No orders found.'
        }
        onRetry={() => {
          setIsLoading(true);
          setError(null);

          void searchService
            .searchOrders({
              q: debouncedQ ? debouncedQ : undefined,
              status: status === 'ALL' ? undefined : status,
              page,
              limit,
            })
            .then((response) => {
              setItems(response.items);
              setTotal(response.total);
            })
            .catch((err) => {
              setError(
                err instanceof Error
                  ? err.message
                  : 'Failed to search orders',
              );
            })
            .finally(() => {
              setIsLoading(false);
            });
        }}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Page <span className="font-medium text-foreground">{page}</span> of{' '}
          <span className="font-medium text-foreground">{totalPages}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading || page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading || page >= totalPages}
            onClick={() =>
              setPage((p) => (p < totalPages ? p + 1 : p))
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

