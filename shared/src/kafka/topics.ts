export const TOPICS = {
  ORDERS: "orders",
  PAYMENTS: "payments",
  ORDER_STATUS_UPDATED: "order.status.updated",
  ORDERS_DLQ: "orders.DLQ",
  ORDER_STATS: "order-stats",
} as const;

export type Topic = (typeof TOPICS)[keyof typeof TOPICS];
