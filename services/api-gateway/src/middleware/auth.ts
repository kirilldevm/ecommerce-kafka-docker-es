import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import type { AccessTokenPayload } from "../types";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, config.jwtSecret) as AccessTokenPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== "ADMIN") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

/** Injects x-user-* headers for downstream microservices. */
export function attachUserHeaders(req: Request): void {
  if (!req.user) {
    return;
  }

  req.headers["x-user-id"] = req.user.sub;
  req.headers["x-user-email"] = req.user.email;
  req.headers["x-user-role"] = req.user.role;
}
