import type { Express } from "express";
import { createMetricsHandler } from "@ecommerce/shared";
import * as analyticsController from "../controllers/analytics.controller";
import { requireAdmin } from "../middleware";
import { registry } from "../metrics";

export function registerAnalyticsRoutes(app: Express): void {
  app.get("/health", analyticsController.health);
  app.get("/metrics", (req, res) => {
    void createMetricsHandler(registry)(req, res);
  });
  app.get(
    "/analytics/summary",
    requireAdmin,
    analyticsController.summary,
  );
}
