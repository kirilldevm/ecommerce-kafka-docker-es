import {
  DELIVERY_EVENT_TYPES,
  ORDER_EVENT_TYPES,
  parseEvent,
  PAYMENT_EVENT_TYPES,
  PRODUCT_EVENT_TYPES,
  runConsumer,
  TOPICS,
} from "@ecommerce/shared";
import type {
  OrderCreatedPayload,
  OrderStatusUpdatedPayload,
  PaymentProcessedPayload,
  ProductDeletedPayload,
  ProductUpsertPayload,
} from "@ecommerce/shared";
import type { Consumer, EachMessagePayload } from "kafkajs";
import { config } from "./config";
import {
  indexOrderFromDb,
  indexProduct,
  removeProduct,
  updateOrderStatus,
} from "./indexer";

async function handleMessage({ topic, message }: EachMessagePayload): Promise<void> {
  const value = message.value;

  if (!value) {
    return;
  }

  try {
    switch (topic) {
      case TOPICS.ORDERS: {
        const event = parseEvent<typeof ORDER_EVENT_TYPES.CREATED, OrderCreatedPayload>(
          value,
        );
        if (event.eventType === ORDER_EVENT_TYPES.CREATED) {
          await indexOrderFromDb(event.payload.orderId);
          console.log(`Search: indexed order ${event.payload.orderId}`);
        }
        break;
      }
      case TOPICS.PAYMENTS: {
        const event = parseEvent<
          typeof PAYMENT_EVENT_TYPES.PROCESSED,
          PaymentProcessedPayload
        >(value);
        if (event.eventType === PAYMENT_EVENT_TYPES.PROCESSED) {
          await indexOrderFromDb(event.payload.orderId);
          console.log(`Search: re-indexed order ${event.payload.orderId} after payment`);
        }
        break;
      }
      case TOPICS.ORDER_STATUS_UPDATED: {
        const event = parseEvent<
          typeof DELIVERY_EVENT_TYPES.STATUS_UPDATED,
          OrderStatusUpdatedPayload
        >(value);
        if (event.eventType === DELIVERY_EVENT_TYPES.STATUS_UPDATED) {
          await updateOrderStatus(event.payload.orderId, event.payload.status);
          console.log(
            `Search: order ${event.payload.orderId} status → ${event.payload.status}`,
          );
        }
        break;
      }
      case TOPICS.PRODUCTS: {
        const event = parseEvent<string, ProductUpsertPayload | ProductDeletedPayload>(
          value,
        );
        if (event.eventType === PRODUCT_EVENT_TYPES.UPSERT) {
          await indexProduct(event.payload as ProductUpsertPayload);
          console.log(`Search: indexed product ${(event.payload as ProductUpsertPayload).id}`);
        } else if (event.eventType === PRODUCT_EVENT_TYPES.DELETED) {
          const { id } = event.payload as ProductDeletedPayload;
          await removeProduct(id);
          console.log(`Search: removed product ${id}`);
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error(`Search: failed to process message on ${topic}:`, err);
  }
}

let consumer: Consumer | null = null;

export async function startSearchConsumer(): Promise<Consumer> {
  consumer = await runConsumer(
    [
      TOPICS.ORDERS,
      TOPICS.PAYMENTS,
      TOPICS.ORDER_STATUS_UPDATED,
      TOPICS.PRODUCTS,
    ],
    handleMessage,
    {
      groupId: "search-service",
      clientId: config.kafkaClientId,
      fromBeginning: false,
    },
  );

  console.log("Search: Kafka consumer started");
  return consumer;
}

export async function stopSearchConsumer(): Promise<void> {
  if (consumer) {
    await consumer.disconnect();
    consumer = null;
  }
}
