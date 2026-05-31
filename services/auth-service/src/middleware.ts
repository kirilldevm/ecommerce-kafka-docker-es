import type { Request, Response, NextFunction } from "express";
import { AuthError } from "./auth.service";

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
  if (err instanceof AuthError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateRegisterBody(body: unknown): { email: string; password: string } {
  if (!body || typeof body !== "object") {
    throw new AuthError("Invalid request body", 400);
  }

  const { email, password } = body as Record<string, unknown>;

  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    throw new AuthError("Email and password are required", 400);
  }

  if (password.length < 6) {
    throw new AuthError("Password must be at least 6 characters", 400);
  }

  return { email, password };
}

export function validateLoginBody(body: unknown): { email: string; password: string } {
  return validateRegisterBody(body);
}

export function validateRefreshBody(body: unknown): { refreshToken: string } {
  if (!body || typeof body !== "object") {
    throw new AuthError("Invalid request body", 400);
  }

  const { refreshToken } = body as Record<string, unknown>;

  if (!isNonEmptyString(refreshToken)) {
    throw new AuthError("refreshToken is required", 400);
  }

  return { refreshToken };
}
