import type { OrderStatus } from '@/types/order.types';

export interface OrderStatusMeta {
  label: string;
  className: string;
}

export const orderStatusConfig: Record<OrderStatus, OrderStatusMeta> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-muted text-muted-foreground',
  },
  PAYMENT_PENDING: {
    label: 'Payment pending',
    className: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
  },
  PAID: {
    label: 'Paid',
    className: 'bg-sky-500/15 text-sky-800 dark:text-sky-300',
  },
  PAYMENT_FAILED: {
    label: 'Payment failed',
    className: 'bg-destructive/15 text-destructive',
  },
  PREPARING: {
    label: 'Preparing',
    className: 'bg-violet-500/15 text-violet-800 dark:text-violet-300',
  },
  SHIPPED: {
    label: 'Shipped',
    className: 'bg-indigo-500/15 text-indigo-800 dark:text-indigo-300',
  },
  DELIVERED: {
    label: 'Delivered',
    className: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-destructive/15 text-destructive',
  },
};

export function getOrderStatusMeta(status: OrderStatus): OrderStatusMeta {
  return orderStatusConfig[status];
}
