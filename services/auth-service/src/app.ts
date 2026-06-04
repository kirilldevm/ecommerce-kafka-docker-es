import express from "express";
import * as authController from "./controllers/auth.controller";
import { createErrorHandler } from "./middleware";
import { registerAuthRoutes } from "./routes";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/health", authController.health);
  registerAuthRoutes(app);

  app.use(createErrorHandler());

  return app;
}
