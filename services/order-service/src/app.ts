import express from "express";
import type { Producer } from "kafkajs";
import { health } from "./controllers/order.controller";
import { createErrorHandler } from "./middleware";
import { registerOrderRoutes } from "./routes";

export function createApp(producer: Producer) {
  const app = express();

  app.use(express.json());

  app.get("/health", health);
  registerOrderRoutes(app, producer);

  app.use(createErrorHandler());

  return app;
}
