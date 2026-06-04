import { parseBody, z } from "@ecommerce/shared";
import { OrderError } from "../errors/order.error";

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "items array is required"),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type CreateOrderItemDto = z.infer<typeof orderItemSchema>;

export function parseCreateOrderBody(body: unknown): CreateOrderItemDto[] {
  const parsed = parseBody(createOrderSchema, body, OrderError);
  return parsed.items;
}
