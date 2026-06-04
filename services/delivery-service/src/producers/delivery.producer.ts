import {
  createDomainEvent,
  DELIVERY_EVENT_TYPES,
  publishEvent,
  TOPICS,
} from "@ecommerce/shared";
import type { OrderStatus } from "@prisma/client";
import type { Producer } from "kafkajs";

export async function publishDeliveryStatusUpdate(
  producer: Producer,
  orderId: string,
  status: OrderStatus,
  previousStatus: OrderStatus,
): Promise<void> {
  await publishEvent(
    producer,
    TOPICS.ORDER_STATUS_UPDATED,
    createDomainEvent(DELIVERY_EVENT_TYPES.STATUS_UPDATED, {
      orderId,
      status,
      previousStatus,
    }),
    { key: orderId },
  );

  console.log(`Delivery: order ${orderId} ${previousStatus} → ${status}`);
}
