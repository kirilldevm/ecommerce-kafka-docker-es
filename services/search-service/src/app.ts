import express from "express";
import { asyncHandler, errorHandler, requireAuth } from "./middleware";
import { health, searchOrdersRoute, searchProductsRoute } from "./routes";

export function createApp() {
  const app = express();

  app.get("/health", asyncHandler(health));
  app.get("/search/products", asyncHandler(searchProductsRoute));
  app.get("/search/orders", requireAuth, asyncHandler(searchOrdersRoute));

  app.use(errorHandler);

  return app;
}
