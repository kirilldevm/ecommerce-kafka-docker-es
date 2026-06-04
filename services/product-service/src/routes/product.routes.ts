import type { Express } from "express";
import * as productController from "../controllers/product.controller";
import { requireAdmin } from "../middleware";

export function registerProductRoutes(app: Express): void {
  app.get("/products", productController.list);
  app.get("/products/:id", productController.getById);

  app.post("/products", requireAdmin, productController.create);
  app.put("/products/:id", requireAdmin, productController.update);
  app.patch("/products/:id", requireAdmin, productController.update);
  app.delete("/products/:id", requireAdmin, productController.remove);
}
