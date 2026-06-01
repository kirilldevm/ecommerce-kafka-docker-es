import {
  createDomainEvent,
  createProducer,
  DELIVERY_EVENT_TYPES,
  parseEvent,
  PAYMENT_EVENT_TYPES,
  prisma,
  publishEvent,
  runConsumer,
  TOPICS,
} from "@ecommerce/shared";
import type { PaymentProcessedPayload } from "@ecommerce/shared";
import { OrderStatus } from "@prisma/client";
import type { Consumer, Producer } from "kafkajs";
import { config } from "./config";

const DELIVERY_STAGES: OrderStatus[] = [
  OrderStatus.PREPARING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

const activeDeliveries = new Set<string>();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function publishStatusUpdate(
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

async function runDeliveryLifecycle(
  orderId: string,
  producer: Producer,
): Promise<void> {
  let order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order || order.status !== OrderStatus.PAID) {
    console.warn(
      `Skipping delivery for ${orderId}: order missing or not PAID (status=${order?.status})`,
    );
    return;
  }

  let previousStatus: OrderStatus = order.status;

  for (const nextStatus of DELIVERY_STAGES) {
    await sleep(config.stageDelayMs);

    order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return;
    }

    if (
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.PAYMENT_FAILED
    ) {
      console.warn(`Stopping delivery for ${orderId}: status is ${order.status}`);
      return;
    }

    if (order.status === OrderStatus.DELIVERED) {
      return;
    }

    await publishStatusUpdate(producer, orderId, nextStatus, previousStatus);
    previousStatus = nextStatus;
  }
}

async function handlePaymentProcessed(
  orderId: string,
  paymentStatus: PaymentProcessedPayload["status"],
  producer: Producer,
): Promise<void> {
  if (paymentStatus !== "SUCCESS") {
    return;
  }

  if (activeDeliveries.has(orderId)) {
    return;
  }

  activeDeliveries.add(orderId);

  try {
    await runDeliveryLifecycle(orderId, producer);
  } finally {
    activeDeliveries.delete(orderId);
  }
}

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
