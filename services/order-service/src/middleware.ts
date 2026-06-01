import type { NextFunction, Request, Response } from "express";
import { OrderError } from "./order.service";

export interface RequestUser {
  id: string;
  email?: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

export function loadUserFromHeaders(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const userId = req.headers["x-user-id"];
  const role = req.headers["x-user-role"];

  if (typeof userId !== "string" || !userId) {
    res.status(401).json({ error: "Missing user context" });
    return;
  }

  req.user = {
    id: userId,
    email: typeof req.headers["x-user-email"] === "string"
      ? req.headers["x-user-email"]
      : undefined,
    role: typeof role === "string" ? role : "USER",
  };

  next();
}

export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof OrderError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
