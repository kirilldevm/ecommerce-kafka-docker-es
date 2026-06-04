import { parseBody, z } from "@ecommerce/shared";
import { ProductError } from "../errors/product.error";

const nonNegativeNumber = z.coerce
  .number()
  .refine((n) => !Number.isNaN(n) && n >= 0, "must be a non-negative number");

const nonNegativeInt = z.coerce
  .number()
  .int()
  .refine((n) => n >= 0, "must be a non-negative integer");

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  description: z.string().trim().optional(),
  price: nonNegativeNumber,
  stock: nonNegativeInt.optional(),
});

export const updateProductSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    description: z.union([z.string().trim(), z.null()]).optional(),
    price: nonNegativeNumber.optional(),
    stock: nonNegativeInt.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;

export function parseCreateProductBody(body: unknown): CreateProductDto {
  return parseBody(createProductSchema, body, ProductError);
}

export function parseUpdateProductBody(body: unknown): UpdateProductDto {
  return parseBody(updateProductSchema, body, ProductError);
}
