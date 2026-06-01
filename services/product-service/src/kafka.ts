import {
  createDomainEvent,
  createProducer,
  PRODUCT_EVENT_TYPES,
  publishEvent,
  TOPICS,
  type ProductUpsertPayload,
} from "@ecommerce/shared";
import type { Producer } from "kafkajs";
import type { formatProduct } from "./product.service";

let producer: Producer | null = null;

export async function startProductKafka(): Promise<void> {
  producer = await createProducer(
    process.env.KAFKA_CLIENT_ID ?? "product-service",
  );
}

export async function stopProductKafka(): Promise<void> {
  if (producer) {
    await producer.disconnect();
    producer = null;
  }
}

function toUpsertPayload(
  product: ReturnType<typeof formatProduct>,
): ProductUpsertPayload {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export async function publishProductUpsert(
  product: ReturnType<typeof formatProduct>,
): Promise<void> {
  if (!producer) {
    return;
  }

  const payload = toUpsertPayload(product);

  await publishEvent(
    producer,
    TOPICS.PRODUCTS,
    createDomainEvent(PRODUCT_EVENT_TYPES.UPSERT, payload),
    { key: payload.id },
  );
}

export async function publishProductDeleted(id: string): Promise<void> {
  if (!producer) {
    return;
  }

  await publishEvent(
    producer,
    TOPICS.PRODUCTS,
    createDomainEvent(PRODUCT_EVENT_TYPES.DELETED, { id }),
    { key: id },
  );
}
