import type { DomainEvent } from "./types";

export const PRODUCT_EVENT_TYPES = {
  UPSERT: "product.upsert",
  DELETED: "product.deleted",
} as const;

export type ProductEventType =
  (typeof PRODUCT_EVENT_TYPES)[keyof typeof PRODUCT_EVENT_TYPES];

export interface ProductUpsertPayload {
  id: string;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDeletedPayload {
  id: string;
}

export type ProductUpsertEvent = DomainEvent<
  typeof PRODUCT_EVENT_TYPES.UPSERT,
  ProductUpsertPayload
>;

export type ProductDeletedEvent = DomainEvent<
  typeof PRODUCT_EVENT_TYPES.DELETED,
  ProductDeletedPayload
>;
