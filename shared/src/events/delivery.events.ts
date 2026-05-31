import type { DomainEvent } from "./types";
import type { OrderStatus } from "@prisma/client";

export const DELIVERY_EVENT_TYPES = {
  STATUS_UPDATED: "order.status.updated",
} as const;

export type DeliveryEventType =
  (typeof DELIVERY_EVENT_TYPES)[keyof typeof DELIVERY_EVENT_TYPES];

export interface OrderStatusUpdatedPayload {
  orderId: string;
  status: OrderStatus;
  previousStatus?: OrderStatus;
}

export type OrderStatusUpdatedEvent = DomainEvent<
  typeof DELIVERY_EVENT_TYPES.STATUS_UPDATED,
  OrderStatusUpdatedPayload
>;
