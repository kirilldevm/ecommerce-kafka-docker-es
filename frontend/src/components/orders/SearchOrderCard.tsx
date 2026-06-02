import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatDateTime, formatOrderId } from '@/lib/format-date';
import { formatPrice } from '@/lib/format-price';
import type { SearchOrder } from '@/types/search.types';

interface SearchOrderCardProps {
  order: SearchOrder;
}

export function SearchOrderCard({ order }: SearchOrderCardProps) {
  const productNames = order.productNames ?? [];
  const preview = productNames.slice(0, 3);
  const restCount = Math.max(0, productNames.length - preview.length);
  const productLabel =
    restCount > 0
      ? `${preview.join(', ')} +${restCount} more`
      : preview.join(', ');

  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base">Order #{formatOrderId(order.orderId)}</CardTitle>
          <CardDescription>{formatDateTime(order.createdAt)}</CardDescription>
        </div>
        <OrderStatusBadge status={order.status} />
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Items</p>
          <p className="text-sm">{productLabel || '—'}</p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold">{formatPrice(order.total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

