import express from "express";
import { errorHandler } from "./middleware";
import { health, login, logout, refresh, register } from "./routes";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/health", health);
  app.post("/register", register);
  app.post("/login", login);
  app.post("/refresh", refresh);
  app.post("/logout", logout);

  app.use(errorHandler);

  return app;
}
