import type { Express } from "express";
import * as searchController from "../controllers/search.controller";
import { requireAuth } from "../middleware";

export function registerSearchRoutes(app: Express): void {
  app.get("/search/products", searchController.searchProductsHandler);
  app.get(
    "/search/orders",
    requireAuth,
    searchController.searchOrdersHandler,
  );
}
