import type { Request, Response } from "express"
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "./auth.service"
import { asyncHandler, validateLoginBody, validateRefreshBody, validateRegisterBody } from "./middleware"

export const register = asyncHandler(async (req, res) => {
  const { email, password } = validateRegisterBody(req.body);

  const user = await registerUser(email, password);

  res.status(201).json({ user });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = validateLoginBody(req.body);

  const result = await loginUser(email, password);

  res.status(200).json(result);
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = validateRefreshBody(req.body);
  const result = await refreshAccessToken(refreshToken);
  res.status(200).json(result);
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = validateRefreshBody(req.body);
  await logoutUser(refreshToken);
  res.status(200).json({ ok: true });
});

export function health(_req: Request, res: Response): void {
  res.status(200).json({ status: "ok" });
}
