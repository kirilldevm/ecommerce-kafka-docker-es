import {
  createDomainEvent,
  PAYMENT_EVENT_TYPES,
  publishEvent,
  TOPICS,
} from "@ecommerce/shared";
import type { Producer } from "kafkajs";

export async function publishPaymentProcessed(
  producer: Producer,
  payload: {
    orderId: string;
    paymentId: string;
    status: "SUCCESS" | "FAILED";
    attempts: number;
    error?: string;
  },
): Promise<void> {
  await publishEvent(
    producer,
    TOPICS.PAYMENTS,
    createDomainEvent(PAYMENT_EVENT_TYPES.PROCESSED, payload),
    { key: payload.orderId },
  );
}

export async function publishPaymentDlq(
  producer: Producer,
  payload: {
    orderId: string;
    paymentId: string;
    attempts: number;
    error?: string;
  },
): Promise<void> {
  await publishEvent(
    producer,
    TOPICS.ORDERS_DLQ,
    createDomainEvent("payment.failed", payload),
    { key: payload.orderId },
  );
}
