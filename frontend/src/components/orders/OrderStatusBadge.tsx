import { getOrderStatusMeta } from '@/config/order-status.config';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types/order.types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const meta = getOrderStatusMeta(status);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        meta.className,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}
