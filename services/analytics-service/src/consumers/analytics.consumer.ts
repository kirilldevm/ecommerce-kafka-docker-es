import {
  DELIVERY_EVENT_TYPES,
  ORDER_EVENT_TYPES,
  parseEvent,
  PAYMENT_EVENT_TYPES,
  runConsumer,
  TOPICS,
} from "@ecommerce/shared";
import type {
  OrderCreatedPayload,
  OrderStatusUpdatedPayload,
  PaymentProcessedPayload,
} from "@ecommerce/shared";
import { OrderStatus } from "@prisma/client";
import type { Consumer, EachMessagePayload } from "kafkajs";
import { config } from "../config";
import { kafkaMetrics } from "../metrics";
import { analyticsStore } from "../store";

async function handleMessage({
  topic,
  message,
}: EachMessagePayload): Promise<void> {
  const value = message.value;

  if (!value) {
    return;
  }

  try {
    switch (topic) {
      case TOPICS.ORDERS: {
        const event = parseEvent<
          typeof ORDER_EVENT_TYPES.CREATED,
          OrderCreatedPayload
        >(value);
        if (event.eventType === ORDER_EVENT_TYPES.CREATED) {
          analyticsStore.recordOrderCreated(
            event.payload.orderId,
            Number(event.payload.total),
          );
          kafkaMetrics.messagesConsumed.inc({ topic, status: "ok" });
          console.log(`Analytics: order created ${event.payload.orderId}`);
        }
        break;
      }
      case TOPICS.PAYMENTS: {
        const event = parseEvent<
          typeof PAYMENT_EVENT_TYPES.PROCESSED,
          PaymentProcessedPayload
        >(value);
        if (event.eventType === PAYMENT_EVENT_TYPES.PROCESSED) {
          if (event.payload.status === "SUCCESS") {
            analyticsStore.recordPaymentSuccess(event.payload.orderId);
          } else {
            analyticsStore.recordPaymentFailed(event.payload.orderId);
          }
          kafkaMetrics.messagesConsumed.inc({ topic, status: "ok" });
          console.log(
            `Analytics: payment ${event.payload.status} for order ${event.payload.orderId}`,
          );
        }
        break;
      }
      case TOPICS.ORDER_STATUS_UPDATED: {
        const event = parseEvent<
          typeof DELIVERY_EVENT_TYPES.STATUS_UPDATED,
          OrderStatusUpdatedPayload
        >(value);
        if (
          event.eventType === DELIVERY_EVENT_TYPES.STATUS_UPDATED &&
          event.payload.status === OrderStatus.DELIVERED
        ) {
          analyticsStore.recordOrderDelivered(event.payload.orderId);
          kafkaMetrics.messagesConsumed.inc({ topic, status: "ok" });
          console.log(`Analytics: order delivered ${event.payload.orderId}`);
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    kafkaMetrics.consumeErrors.inc({ topic });
    console.error(`Analytics: failed to process message on ${topic}:`, err);
  }
}

let consumer: Consumer | null = null;

export async function startAnalyticsConsumer(): Promise<Consumer> {
  consumer = await runConsumer(
    [TOPICS.ORDERS, TOPICS.PAYMENTS, TOPICS.ORDER_STATUS_UPDATED],
    handleMessage,
    {
      groupId: "analytics-service",
      clientId: config.kafkaClientId,
      fromBeginning: false,
    },
  );

  console.log("Analytics: Kafka consumer started");
  return consumer;
}

export async function stopAnalyticsConsumer(): Promise<void> {
  if (consumer) {
    await consumer.disconnect();
    consumer = null;
  }
}
