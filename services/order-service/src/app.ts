import express from "express";
import type { Producer } from "kafkajs";
import { errorHandler, loadUserFromHeaders } from "./middleware";
import { createRoutes, health } from "./routes";

export function createApp(producer: Producer) {
  const app = express();
  const routes = createRoutes(producer);

  app.use(express.json());

  app.get("/health", health);

  app.use(loadUserFromHeaders);

  app.get("/orders/stream", routes.stream);
  app.get("/orders", routes.list);
  app.get("/orders/:id", routes.getById);
  app.post("/orders", routes.create);

  app.use(errorHandler);

  return app;
}
