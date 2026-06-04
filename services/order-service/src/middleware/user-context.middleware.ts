import type { NextFunction, Request, Response } from "express";

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
    email:
      typeof req.headers["x-user-email"] === "string"
        ? req.headers["x-user-email"]
        : undefined,
    role: typeof role === "string" ? role : "USER",
  };

  next();
}
