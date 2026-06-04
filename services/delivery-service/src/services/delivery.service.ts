import { prisma } from "@ecommerce/shared";
import type { PaymentProcessedPayload } from "@ecommerce/shared";
import { OrderStatus } from "@prisma/client";
import type { Producer } from "kafkajs";
import { config } from "../config";
import { publishDeliveryStatusUpdate } from "../producers/delivery.producer";

const DELIVERY_STAGES: OrderStatus[] = [
  OrderStatus.PREPARING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

const activeDeliveries = new Set<string>();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
      console.warn(
        `Stopping delivery for ${orderId}: status is ${order.status}`,
      );
      return;
    }

    if (order.status === OrderStatus.DELIVERED) {
      return;
    }

    await publishDeliveryStatusUpdate(
      producer,
      orderId,
      nextStatus,
      previousStatus,
    );
    previousStatus = nextStatus;
  }
}

export async function handlePaymentProcessed(
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
