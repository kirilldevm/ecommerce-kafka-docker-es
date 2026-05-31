import type { DomainEvent } from "./types";

export const ORDER_EVENT_TYPES = {
  CREATED: "order.created",
} as const;

export type OrderEventType =
  (typeof ORDER_EVENT_TYPES)[keyof typeof ORDER_EVENT_TYPES];

export interface OrderItemSnapshot {
  productId: string;
  quantity: number;
  unitPrice: string;
}

export interface OrderCreatedPayload {
  orderId: string;
  userId: string;
  total: string;
  items: OrderItemSnapshot[];
}

export type OrderCreatedEvent = DomainEvent<
  typeof ORDER_EVENT_TYPES.CREATED,
  OrderCreatedPayload
>;
