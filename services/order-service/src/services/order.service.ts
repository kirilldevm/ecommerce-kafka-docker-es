import { prisma } from "@ecommerce/shared";
import type { Order, OrderItem, OrderStatus, Product } from "@ecommerce/shared";
import { OrderStatus as OrderStatusEnum, Prisma } from "@prisma/client";
import type { Producer } from "kafkajs";
import type { CreateOrderItemDto } from "../dto/order.dto";
import { OrderError } from "../errors/order.error";
import { publishOrderCreated } from "../producers/order.producer";
import { broadcastOrderEvent } from "../sse";

type OrderWithItems = Order & { items: (OrderItem & { product: Product })[] };

export type FormattedOrder = ReturnType<typeof formatOrder>;

export function formatOrderItem(item: OrderItem & { product?: Product }) {
  return {
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice.toString(),
    product: item.product
      ? {
          id: item.product.id,
          name: item.product.name,
        }
      : undefined,
  };
}

export function formatOrder(order: OrderWithItems) {
  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    total: order.total.toString(),
    items: order.items.map(formatOrderItem),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

const orderInclude = {
  items: { include: { product: true } },
} as const;

export async function createOrder(
  userId: string,
  itemsInput: CreateOrderItemDto[],
  producer: Producer,
) {
  const order = await prisma.$transaction(async (tx) => {
    let total = new Prisma.Decimal(0);

    const lineItems: {
      productId: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
    }[] = [];

    for (const item of itemsInput) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new OrderError(`Product not found: ${item.productId}`, 404);
      }

      if (product.stock < item.quantity) {
        throw new OrderError(
          `Insufficient stock for product: ${product.name}`,
          400,
        );
      }

      const unitPrice = product.price;
      total = total.add(unitPrice.mul(item.quantity));

      lineItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice,
      });

      await tx.product.update({
        where: { id: product.id },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return tx.order.create({
      data: {
        userId,
        status: OrderStatusEnum.PAYMENT_PENDING,
        total,
        items: {
          create: lineItems,
        },
      },
      include: orderInclude,
    });
  });

  const formatted = formatOrder(order);
  await publishOrderCreated(producer, order, formatted);

  return formatted;
}

export async function listOrdersForUser(userId: string, isAdmin: boolean) {
  const orders = await prisma.order.findMany({
    where: isAdmin ? undefined : { userId },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });

  return orders.map(formatOrder);
}

export async function getOrderById(
  orderId: string,
  userId: string,
  isAdmin: boolean,
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });

  if (!order) {
    throw new OrderError("Order not found", 404);
  }

  if (!isAdmin && order.userId !== userId) {
    throw new OrderError("Forbidden", 403);
  }

  return formatOrder(order);
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  broadcast = true,
) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: orderInclude,
  });

  const formatted = formatOrder(order);

  if (broadcast) {
    broadcastOrderEvent("order.status.updated", { order: formatted });
  }

  return formatted;
}
