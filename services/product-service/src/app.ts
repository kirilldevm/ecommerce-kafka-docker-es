import express from "express";
import * as productController from "./controllers/product.controller";
import { createErrorHandler } from "./middleware";
import { registerProductRoutes } from "./routes";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/health", productController.health);
  registerProductRoutes(app);

  app.use(createErrorHandler());

  return app;
}
