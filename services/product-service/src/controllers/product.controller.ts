import { asyncHandler } from '@ecommerce/shared';
import type { Request, Response } from 'express';
import {
  parseCreateProductBody,
  parseUpdateProductBody,
} from '../dto/product.dto';
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from '../services/product.service';

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const products = await listProducts();
  res.json({ products });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const product = await getProductById(req.params.id);
  res.json({ product });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = parseCreateProductBody(req.body);
  const product = await createProduct(input);
  res.status(201).json({ product });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = parseUpdateProductBody(req.body);
  const product = await updateProduct(req.params.id, input);
  res.json({ product });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteProduct(req.params.id);
  res.status(204).send();
});

export function health(_req: Request, res: Response): void {
  res.json({ status: 'ok' });
}
