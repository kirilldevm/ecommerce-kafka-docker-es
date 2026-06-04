import type { Express } from "express";
import type { Producer } from "kafkajs";
import { createOrderController } from "../controllers/order.controller";
import { loadUserFromHeaders } from "../middleware";

export function registerOrderRoutes(app: Express, producer: Producer): void {
  const controller = createOrderController(producer);

  app.use(loadUserFromHeaders);

  app.get("/orders/stream", controller.stream);
  app.get("/orders", controller.list);
  app.get("/orders/:id", controller.getById);
  app.post("/orders", controller.create);
}
