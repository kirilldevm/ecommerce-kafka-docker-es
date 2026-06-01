import express from "express";
import { errorHandler, requireAdmin } from "./middleware";
import { create, getById, health, list, remove, update } from "./routes";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/health", health);

  app.get("/products", list);
  app.get("/products/:id", getById);

  app.post("/products", requireAdmin, create);
  app.put("/products/:id", requireAdmin, update);
  app.patch("/products/:id", requireAdmin, update);
  app.delete("/products/:id", requireAdmin, remove);

  app.use(errorHandler);

  return app;
}
