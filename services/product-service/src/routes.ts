import type { Request, Response } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
  validateCreateBody,
  validateUpdateBody,
} from "./product.service";
import { asyncHandler } from "./middleware";

export const list = asyncHandler(async (_req, res) => {
  const products = await listProducts();
  res.json({ products });
});

export const getById = asyncHandler(async (req, res) => {
  const product = await getProductById(req.params.id);
  res.json({ product });
});

export const create = asyncHandler(async (req, res) => {
  const input = validateCreateBody(req.body);
  const product = await createProduct(input);
  res.status(201).json({ product });
});

export const update = asyncHandler(async (req, res) => {
  const input = validateUpdateBody(req.body);
  const product = await updateProduct(req.params.id, input);
  res.json({ product });
});

export const remove = asyncHandler(async (req, res) => {
  await deleteProduct(req.params.id);
  res.status(204).send();
});

export function health(_req: Request, res: Response): void {
  res.json({ status: "ok" });
}
