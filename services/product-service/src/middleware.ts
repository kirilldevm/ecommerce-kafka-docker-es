import type { NextFunction, Request, Response } from "express";
import { ProductError } from "./product.service";

export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const role = req.headers["x-user-role"];

  if (role !== "ADMIN") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  next();
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ProductError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
