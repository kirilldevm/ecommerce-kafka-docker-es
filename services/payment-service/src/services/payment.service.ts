import { prisma } from "@ecommerce/shared";
import { PaymentStatus } from "@prisma/client";
import type { Producer } from "kafkajs";
import { config } from "../config";
import {
  publishPaymentDlq,
  publishPaymentProcessed,
} from "../producers/payment.producer";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function simulatePaymentSuccess(): boolean {
  return Math.random() >= config.failureRate;
}

export async function processPayment(
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

  await publishPaymentProcessed(producer, {
    orderId,
    paymentId: payment.id,
    status: success ? "SUCCESS" : "FAILED",
    attempts,
    error: lastError,
  });

  if (!success) {
    await publishPaymentDlq(producer, {
      orderId,
      paymentId: payment.id,
      attempts,
      error: lastError,
    });
  }

  console.log(`Payment for order ${orderId}: ${status} (${attempts} attempts)`);
}
