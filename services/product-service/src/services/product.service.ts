import type { Product } from "@ecommerce/shared";
import { prisma } from "@ecommerce/shared";
import { Prisma } from "@prisma/client";
import type { CreateProductDto, UpdateProductDto } from "../dto/product.dto";
import { ProductError } from "../errors/product.error";
import {
  publishProductDeleted,
  publishProductUpsert,
} from "../producers/product.producer";

export type FormattedProduct = ReturnType<typeof formatProduct>;

export function formatProduct(product: Product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price.toString(),
    stock: product.stock,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export async function listProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return products.map(formatProduct);
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    throw new ProductError("Product not found", 404);
  }

  return formatProduct(product);
}

export async function createProduct(input: CreateProductDto) {
  try {
    const product = await prisma.product.create({
      data: {
        name: input.name,
        description: input.description,
        price: new Prisma.Decimal(input.price),
        stock: input.stock ?? 0,
      },
    });

    const formatted = formatProduct(product);
    await publishProductUpsert(formatted);
    return formatted;
  } catch (err) {
    if (err instanceof ProductError) {
      throw err;
    }
    throw new ProductError("Failed to create product", 500);
  }
}

export async function updateProduct(id: string, input: UpdateProductDto) {
  await getProductById(id);

  const data: Prisma.ProductUpdateInput = {};

  if (input.name !== undefined) {
    data.name = input.name;
  }
  if (input.description !== undefined) {
    data.description = input.description;
  }
  if (input.price !== undefined) {
    data.price = new Prisma.Decimal(input.price);
  }
  if (input.stock !== undefined) {
    data.stock = input.stock;
  }

  const product = await prisma.product.update({
    where: { id },
    data,
  });

  const formatted = formatProduct(product);
  await publishProductUpsert(formatted);
  return formatted;
}

export async function deleteProduct(id: string) {
  await getProductById(id);

  await prisma.product.delete({ where: { id } });
  await publishProductDeleted(id);
}
