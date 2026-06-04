import {
  createDomainEvent,
  ORDER_EVENT_TYPES,
  publishEvent,
  TOPICS,
} from "@ecommerce/shared";
import type { Producer } from "kafkajs";
import type { FormattedOrder } from "../services/order.service";
import { broadcastOrderEvent } from "../sse";

export async function publishOrderCreated(
  producer: Producer,
  order: {
    id: string;
    userId: string;
    total: { toString(): string };
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: { toString(): string };
    }>;
  },
  formatted: FormattedOrder,
): Promise<void> {
  await publishEvent(
    producer,
    TOPICS.ORDERS,
    createDomainEvent(ORDER_EVENT_TYPES.CREATED, {
      orderId: order.id,
      userId: order.userId,
      total: order.total.toString(),
      items: order.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice.toString(),
      })),
    }),
    { key: order.id },
  );

  broadcastOrderEvent("order.created", { order: formatted });
}
