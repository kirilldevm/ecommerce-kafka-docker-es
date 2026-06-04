import {
  DELIVERY_EVENT_TYPES,
  parseEvent,
  PAYMENT_EVENT_TYPES,
  runConsumer,
  TOPICS,
} from "@ecommerce/shared";
import type {
  OrderStatusUpdatedPayload,
  PaymentProcessedPayload,
} from "@ecommerce/shared";
import { OrderStatus } from "@prisma/client";
import type { Consumer } from "kafkajs";
import { config } from "../config";
import { updateOrderStatus } from "../services/order.service";

let paymentConsumer: Consumer | null = null;
let deliveryConsumer: Consumer | null = null;

export async function startOrderConsumers(): Promise<void> {
  paymentConsumer = await runConsumer(
    [TOPICS.PAYMENTS],
    async ({ message }) => {
      const event = parseEvent<
        typeof PAYMENT_EVENT_TYPES.PROCESSED,
        PaymentProcessedPayload
      >(message.value);

      if (event.eventType !== PAYMENT_EVENT_TYPES.PROCESSED) {
        return;
      }

      const { orderId, status } = event.payload;
      const nextStatus =
        status === "SUCCESS" ? OrderStatus.PAID : OrderStatus.PAYMENT_FAILED;

      await updateOrderStatus(orderId, nextStatus);
      console.log(`Order ${orderId} → ${nextStatus} (payment)`);
    },
    {
      groupId: "order-service-payments",
      clientId: `${config.kafkaClientId}-payments`,
    },
  );

  deliveryConsumer = await runConsumer(
    [TOPICS.ORDER_STATUS_UPDATED],
    async ({ message }) => {
      const event = parseEvent<
        typeof DELIVERY_EVENT_TYPES.STATUS_UPDATED,
        OrderStatusUpdatedPayload
      >(message.value);

      if (event.eventType !== DELIVERY_EVENT_TYPES.STATUS_UPDATED) {
        return;
      }

      const { orderId, status } = event.payload;
      await updateOrderStatus(orderId, status);
      console.log(`Order ${orderId} → ${status} (delivery)`);
    },
    {
      groupId: "order-service-delivery",
      clientId: `${config.kafkaClientId}-delivery`,
    },
  );

  console.log("Kafka consumers started (payments, delivery)");
}

export async function stopOrderConsumers(): Promise<void> {
  await Promise.all([
    paymentConsumer?.disconnect(),
    deliveryConsumer?.disconnect(),
  ]);
  paymentConsumer = null;
  deliveryConsumer = null;
}
