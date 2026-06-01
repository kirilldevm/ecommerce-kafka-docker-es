import { prisma } from "@ecommerce/shared";
import { PaymentStatus } from "@prisma/client";
import { analyticsStore } from "./store";

export async function bootstrapFromDatabase(): Promise<void> {
  const orders = await prisma.order.findMany({
    include: {
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  for (const order of orders) {
    const latestPayment = order.payments[0];
    const paymentSucceeded = latestPayment?.status === PaymentStatus.SUCCESS;

    analyticsStore.seedOrder({
      orderId: order.id,
      total: Number(order.total),
      createdAt: order.createdAt.getTime(),
      deliveredAt: order.updatedAt.getTime(),
      status: order.status,
      paymentSucceeded,
    });
  }

  console.log(`Analytics: bootstrapped from ${orders.length} orders`);
}
