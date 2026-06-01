import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDateTime, formatOrderId } from '@/lib/format-date';
import { formatPrice, multiplyPrice } from '@/lib/format-price';
import type { Order } from '@/types/order.types';

interface OrderCardProps {
  order: Order;
  showCustomer?: boolean;
}

export function OrderCard({ order, showCustomer = false }: OrderCardProps) {
  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base">Order #{formatOrderId(order.id)}</CardTitle>
          <CardDescription>{formatDateTime(order.createdAt)}</CardDescription>
        </div>
        <OrderStatusBadge status={order.status} className="self-start" />
      </CardHeader>

      <CardContent className="space-y-4">
        {showCustomer ? (
          <p className="text-sm text-muted-foreground">
            Customer ID: <span className="font-mono text-foreground">{order.userId}</span>
          </p>
        ) : null}

        <ul className="space-y-2">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {item.product?.name ?? 'Product'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity} x {formatPrice(item.unitPrice)}
                </p>
              </div>
              <p className="shrink-0 font-medium">
                {formatPrice(multiplyPrice(item.unitPrice, item.quantity))}
              </p>
            </li>
          ))}
        </ul>

        <Separator />

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="text-base font-semibold">{formatPrice(order.total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
