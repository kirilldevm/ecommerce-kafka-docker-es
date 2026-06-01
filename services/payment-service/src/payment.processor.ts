import {
  createDomainEvent,
  createProducer,
  ORDER_EVENT_TYPES,
  parseEvent,
  PAYMENT_EVENT_TYPES,
  prisma,
  publishEvent,
  runConsumer,
  TOPICS,
} from "@ecommerce/shared";
import type { OrderCreatedPayload } from "@ecommerce/shared";
import { PaymentStatus } from "@prisma/client";
import type { Consumer, Producer } from "kafkajs";
import { config } from "./config";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function simulatePaymentSuccess(): boolean {
  return Math.random() >= config.failureRate;
}

async function processPayment(
  orderId: string,
  producer: Producer,
): Promise<void> {
  let payment = await prisma.payment.create({
    data: { orderId, status: PaymentStatus.PENDING },
  });

  let attempts = 0;
  let lastError: string | undefined;
  let success = false;

  while (attempts < config.maxAttempts && !success) {
    attempts += 1;
    await sleep(config.retryDelayMs);

    if (simulatePaymentSuccess()) {
      success = true;
      break;
    }

    lastError = `Simulated payment failure (attempt ${attempts})`;
    console.warn(`Payment retry for order ${orderId}: ${lastError}`);
  }

  const status = success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;

  payment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status,
      attempts,
      lastError: success ? null : lastError,
    },
  });

  await publishEvent(
    producer,
    TOPICS.PAYMENTS,
    createDomainEvent(PAYMENT_EVENT_TYPES.PROCESSED, {
      orderId,
      paymentId: payment.id,
      status: success ? "SUCCESS" : "FAILED",
      attempts,
      error: lastError,
    }),
    { key: orderId },
  );

  if (!success) {
    await publishEvent(
      producer,
      TOPICS.ORDERS_DLQ,
      createDomainEvent("payment.failed", {
        orderId,
        paymentId: payment.id,
        attempts,
        error: lastError,
      }),
      { key: orderId },
    );
  }

  console.log(`Payment for order ${orderId}: ${status} (${attempts} attempts)`);
}

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
