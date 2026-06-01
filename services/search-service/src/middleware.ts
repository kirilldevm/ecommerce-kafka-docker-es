import type { NextFunction, Request, Response } from "express";

export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const userId = req.headers["x-user-id"];

  if (!userId || typeof userId !== "string") {
    res.status(401).json({ error: "Authentication required" });
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
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
