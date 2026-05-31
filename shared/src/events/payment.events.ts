import type { DomainEvent } from "./types";

export const PAYMENT_EVENT_TYPES = {
  PROCESSED: "payment.processed",
} as const;

export type PaymentEventType =
  (typeof PAYMENT_EVENT_TYPES)[keyof typeof PAYMENT_EVENT_TYPES];

export type PaymentOutcome = "SUCCESS" | "FAILED";

export interface PaymentProcessedPayload {
  orderId: string;
  paymentId: string;
  status: PaymentOutcome;
  attempts: number;
  error?: string;
}

export type PaymentProcessedEvent = DomainEvent<
  typeof PAYMENT_EVENT_TYPES.PROCESSED,
  PaymentProcessedPayload
>;
