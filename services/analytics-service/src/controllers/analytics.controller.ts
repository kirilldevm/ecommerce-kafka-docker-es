import { asyncHandler } from "@ecommerce/shared";
import type { Request, Response } from "express";
import { analyticsStore } from "../store";

export const health = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

export const summary = asyncHandler(async (_req: Request, res: Response) => {
  res.json(analyticsStore.getSummary());
});
