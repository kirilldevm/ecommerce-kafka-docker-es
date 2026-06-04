import {
  createProducer,
  ORDER_EVENT_TYPES,
  parseEvent,
  runConsumer,
  TOPICS,
} from "@ecommerce/shared";
import type { OrderCreatedPayload } from "@ecommerce/shared";
import type { Consumer, Producer } from "kafkajs";
import { config } from "../config";
import { processPayment } from "../services/payment.service";

let consumer: Consumer | null = null;

export async function startPaymentConsumer(): Promise<Producer> {
  const producer = await createProducer(config.kafkaClientId);

  consumer = await runConsumer(
    [TOPICS.ORDERS],
    async ({ message }) => {
      const event = parseEvent<
        typeof ORDER_EVENT_TYPES.CREATED,
        OrderCreatedPayload
      >(message.value);

      if (event.eventType !== ORDER_EVENT_TYPES.CREATED) {
        return;
      }

      await processPayment(event.payload.orderId, producer);
    },
    {
      groupId: "payment-service",
      clientId: config.kafkaClientId,
    },
  );

  console.log("Payment consumer listening on orders topic");
  return producer;
}

export async function stopPaymentConsumer(producer: Producer): Promise<void> {
  await consumer?.disconnect();
  consumer = null;
  await producer.disconnect();
}
