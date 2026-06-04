import { asyncHandler } from "@ecommerce/shared";
import type { Request, Response } from "express";
import {
  parseSearchOrdersQuery,
  parseSearchProductsQuery,
} from "../dto/search.dto";
import { searchOrders, searchProducts } from "../services/search.service";

export const health = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

export const searchProductsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const query = parseSearchProductsQuery(req.query);

    const result = await searchProducts({
      q: query.q || undefined,
      minPrice:
        query.minPrice !== undefined && Number.isFinite(query.minPrice)
          ? query.minPrice
          : undefined,
      maxPrice:
        query.maxPrice !== undefined && Number.isFinite(query.maxPrice)
          ? query.maxPrice
          : undefined,
      page: query.page,
      limit: query.limit,
    });

    res.json(result);
  },
);

export const searchOrdersHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.headers["x-user-id"];
    const role = req.headers["x-user-role"];

    if (typeof userId !== "string") {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const query = parseSearchOrdersQuery(req.query);

    const result = await searchOrders({
      q: query.q || undefined,
      status: query.status || undefined,
      userId,
      isAdmin: role === "ADMIN",
      page: query.page,
      limit: query.limit,
    });

    res.json(result);
  },
);
