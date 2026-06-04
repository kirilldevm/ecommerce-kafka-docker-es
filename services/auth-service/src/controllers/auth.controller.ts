import { asyncHandler } from "@ecommerce/shared";
import type { Request, Response } from "express";
import {
  parseLoginBody,
  parseRefreshBody,
  parseRegisterBody,
} from "../dto/auth.dto";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../services/auth.service";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = parseRegisterBody(req.body);
  const user = await registerUser(email, password);
  res.status(201).json({ user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = parseLoginBody(req.body);
  const result = await loginUser(email, password);
  res.status(200).json(result);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = parseRefreshBody(req.body);
  const result = await refreshAccessToken(refreshToken);
  res.status(200).json(result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = parseRefreshBody(req.body);
  await logoutUser(refreshToken);
  res.status(200).json({ ok: true });
});

export function health(_req: Request, res: Response): void {
  res.status(200).json({ status: "ok" });
}
