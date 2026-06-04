import type { Express } from "express";
import * as authController from "../controllers/auth.controller";

export function registerAuthRoutes(app: Express): void {
  app.post("/register", authController.register);
  app.post("/login", authController.login);
  app.post("/refresh", authController.refresh);
  app.post("/logout", authController.logout);
}
