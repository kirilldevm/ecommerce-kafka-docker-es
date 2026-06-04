import express from "express";
import * as searchController from "./controllers/search.controller";
import { createErrorHandler } from "./middleware";
import { registerSearchRoutes } from "./routes";

export function createApp() {
  const app = express();

  app.get("/health", searchController.health);
  registerSearchRoutes(app);

  app.use(createErrorHandler());

  return app;
}
