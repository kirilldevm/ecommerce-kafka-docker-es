import { createMetricsHandler } from "@ecommerce/shared";
import express from "express";
import { asyncHandler, errorHandler, requireAdmin } from "./middleware";
import { registry } from "./metrics";
import { health, summary } from "./routes";

export function createApp() {
  const app = express();

  app.get("/health", asyncHandler(health));
  app.get("/metrics", (req, res) => {
    void createMetricsHandler(registry)(req, res);
  });
  app.get("/analytics/summary", requireAdmin, asyncHandler(summary));

  app.use(errorHandler);

  return app;
}
