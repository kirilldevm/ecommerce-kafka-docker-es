import type { Request, Response } from "express";
import express from "express";
import { requireAdmin, requireAuth } from "./middleware/auth";
import { errorHandler } from "./middleware/error";
import {
  authProxy,
  createProtectedProxy,
  createPublicProxy,
} from "./proxy/setup";
import { config } from "./config";

const productPublicProxy = createPublicProxy(config.productServiceUrl);
const productProtectedProxy = createProtectedProxy(config.productServiceUrl);
const orderProtectedProxy = createProtectedProxy(config.orderServiceUrl);

export function createApp() {
  const app = express();

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  app.use("/auth", express.json(), authProxy);

  app.get("/products", productPublicProxy);
  app.get("/products/:id", productPublicProxy);

  app.post(
    "/products",
    requireAuth,
    requireAdmin,
    express.json(),
    productProtectedProxy,
  );
  app.put(
    "/products/:id",
    requireAuth,
    requireAdmin,
    express.json(),
    productProtectedProxy,
  );
  app.patch(
    "/products/:id",
    requireAuth,
    requireAdmin,
    express.json(),
    productProtectedProxy,
  );
  app.delete(
    "/products/:id",
    requireAuth,
    requireAdmin,
    productProtectedProxy,
  );

  app.get("/orders/stream", requireAuth, orderProtectedProxy);
  app.get("/orders", requireAuth, orderProtectedProxy);
  app.get("/orders/:id", requireAuth, orderProtectedProxy);
  app.post("/orders", requireAuth, express.json(), orderProtectedProxy);

  app.use(errorHandler);

  return app;
}
