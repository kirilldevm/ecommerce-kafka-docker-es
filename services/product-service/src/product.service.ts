import type { Product } from "@ecommerce/shared";
import { prisma } from "@ecommerce/shared";
import { Prisma } from "@prisma/client";

export class ProductError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = "ProductError";
  }
}

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

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  stock?: number;
}

export interface UpdateProductInput {
  name?: string;
  description?: string | null;
  price?: number;
  stock?: number;
}

function parsePrice(value: unknown, field = "price"): number {
  const price = typeof value === "string" ? Number(value) : value;

  if (typeof price !== "number" || Number.isNaN(price) || price < 0) {
    throw new ProductError(`${field} must be a non-negative number`, 400);
  }

  return price;
}

function parseStock(value: unknown): number {
  const stock = typeof value === "string" ? Number(value) : value;

  if (typeof stock !== "number" || !Number.isInteger(stock) || stock < 0) {
    throw new ProductError("stock must be a non-negative integer", 400);
  }

  return stock;
}

export function validateCreateBody(body: unknown): CreateProductInput {
  if (!body || typeof body !== "object") {
    throw new ProductError("Invalid request body", 400);
  }

  const { name, description, price, stock } = body as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length === 0) {
    throw new ProductError("name is required", 400);
  }

  const parsed: CreateProductInput = {
    name: name.trim(),
    price: parsePrice(price),
  };

  if (description !== undefined) {
    if (description !== null && typeof description !== "string") {
      throw new ProductError("description must be a string", 400);
    }
    parsed.description = description?.trim() || undefined;
  }

  if (stock !== undefined) {
    parsed.stock = parseStock(stock);
  }

  return parsed;
}

export function validateUpdateBody(body: unknown): UpdateProductInput {
  if (!body || typeof body !== "object") {
    throw new ProductError("Invalid request body", 400);
  }

  const { name, description, price, stock } = body as Record<string, unknown>;
  const parsed: UpdateProductInput = {};

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new ProductError("name must be a non-empty string", 400);
    }
    parsed.name = name.trim();
  }

  if (description !== undefined) {
    if (description !== null && typeof description !== "string") {
      throw new ProductError("description must be a string or null", 400);
    }
    parsed.description = description === null ? null : description.trim() || null;
  }

  if (price !== undefined) {
    parsed.price = parsePrice(price);
  }

  if (stock !== undefined) {
    parsed.stock = parseStock(stock);
  }

  if (Object.keys(parsed).length === 0) {
    throw new ProductError("At least one field is required to update", 400);
  }

  return parsed;
}

export async function createProduct(input: CreateProductInput) {
  try {
    const product = await prisma.product.create({
      data: {
        name: input.name,
        description: input.description,
        price: new Prisma.Decimal(input.price),
        stock: input.stock ?? 0,
      },
    });

    return formatProduct(product);
  } catch (err) {
    if (err instanceof ProductError) {
      throw err;
    }
    throw new ProductError("Failed to create product", 500);
  }
}

export async function updateProduct(id: string, input: UpdateProductInput) {
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

  return formatProduct(product);
}

export async function deleteProduct(id: string) {
  await getProductById(id);

  await prisma.product.delete({ where: { id } });
}
