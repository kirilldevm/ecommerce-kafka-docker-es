import {
  createProducer,
  parseEvent,
  PAYMENT_EVENT_TYPES,
  runConsumer,
  TOPICS,
} from "@ecommerce/shared";
import type { PaymentProcessedPayload } from "@ecommerce/shared";
import type { Consumer, Producer } from "kafkajs";
import { config } from "../config";
import { handlePaymentProcessed } from "../services/delivery.service";

let consumer: Consumer | null = null;

export async function startDeliveryConsumer(): Promise<Producer> {
  const producer = await createProducer(config.kafkaClientId);

  consumer = await runConsumer(
    [TOPICS.PAYMENTS],
    async ({ message }) => {
      const event = parseEvent<
        typeof PAYMENT_EVENT_TYPES.PROCESSED,
        PaymentProcessedPayload
      >(message.value);

      if (event.eventType !== PAYMENT_EVENT_TYPES.PROCESSED) {
        return;
      }

      await handlePaymentProcessed(
        event.payload.orderId,
        event.payload.status,
        producer,
      );
    },
    {
      groupId: "delivery-service",
      clientId: config.kafkaClientId,
    },
  );

  console.log("Delivery consumer listening on payments topic");
  return producer;
}

export async function stopDeliveryConsumer(producer: Producer): Promise<void> {
  await consumer?.disconnect();
  consumer = null;
  await producer.disconnect();
}
