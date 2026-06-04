import express from "express";
import { createErrorHandler } from "./middleware";
import { registerAnalyticsRoutes } from "./routes";

export function createApp() {
  const app = express();

  registerAnalyticsRoutes(app);

  app.use(createErrorHandler());

  return app;
}
