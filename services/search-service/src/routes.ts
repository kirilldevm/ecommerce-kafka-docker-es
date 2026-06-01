import type { Request, Response } from "express";
import { searchOrders, searchProducts } from "./search.service";

function parsePage(value: unknown, fallback = 1): number {
  const page = Number(value ?? fallback);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : fallback;
}

function parseLimit(value: unknown, fallback = 20): number {
  const limit = Number(value ?? fallback);
  if (!Number.isFinite(limit) || limit <= 0) {
    return fallback;
  }
  return Math.min(Math.floor(limit), 100);
}

export async function health(_req: Request, res: Response): Promise<void> {
  res.json({ status: "ok" });
}

export async function searchProductsRoute(req: Request, res: Response): Promise<void> {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : undefined;
  const minPrice =
    req.query.minPrice !== undefined ? Number(req.query.minPrice) : undefined;
  const maxPrice =
    req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined;

  const result = await searchProducts({
    q: q || undefined,
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    page: parsePage(req.query.page),
    limit: parseLimit(req.query.limit),
  });

  res.json(result);
}

export async function searchOrdersRoute(req: Request, res: Response): Promise<void> {
  const userId = req.headers["x-user-id"];
  const role = req.headers["x-user-role"];
  const isAdmin = role === "ADMIN";

  if (typeof userId !== "string") {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const q = typeof req.query.q === "string" ? req.query.q.trim() : undefined;
  const status =
    typeof req.query.status === "string" ? req.query.status.trim() : undefined;

  const result = await searchOrders({
    q: q || undefined,
    status: status || undefined,
    userId,
    isAdmin,
    page: parsePage(req.query.page),
    limit: parseLimit(req.query.limit),
  });

  res.json(result);
}
