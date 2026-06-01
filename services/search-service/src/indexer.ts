import { prisma } from "@ecommerce/shared";
import type { ProductUpsertPayload } from "@ecommerce/shared";
import type { OrderStatus } from "@prisma/client";
import {
  deleteDocument,
  orderDocId,
  productDocId,
  upsertDocument,
} from "./elasticsearch";

export async function indexProduct(payload: ProductUpsertPayload): Promise<void> {
  await upsertDocument(productDocId(payload.id), {
    entityType: "product",
    productId: payload.id,
    name: payload.name,
    description: payload.description ?? "",
    price: Number(payload.price),
    stock: payload.stock,
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt,
  });
}

export async function removeProduct(productId: string): Promise<void> {
  await deleteDocument(productDocId(productId));
}

export async function indexOrderFromDb(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
    },
  });

  if (!order) {
    return;
  }

  const productNames = order.items.map((item) => item.product.name);
  const productIds = order.items.map((item) => item.productId);

  await upsertDocument(orderDocId(order.id), {
    entityType: "order",
    orderId: order.id,
    userId: order.userId,
    status: order.status,
    total: Number(order.total),
    productNames,
    productIds,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  });
}

export async function updateOrderStatus(orderId: string, _status: OrderStatus): Promise<void> {
  await indexOrderFromDb(orderId);
}

export async function syncCatalogFromDatabase(): Promise<void> {
  const products = await prisma.product.findMany();

  for (const product of products) {
    await indexProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    });
  }

  console.log(`Search: synced ${products.length} products from database`);
}

export async function syncOrdersFromDatabase(): Promise<void> {
  const orders = await prisma.order.findMany({ select: { id: true } });

  for (const { id } of orders) {
    await indexOrderFromDb(id);
  }

  console.log(`Search: synced ${orders.length} orders from database`);
}
