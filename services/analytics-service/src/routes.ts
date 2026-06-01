import type { Request, Response } from "express";
import { analyticsStore } from "./store";

export async function health(_req: Request, res: Response): Promise<void> {
  res.json({ status: "ok" });
}

export async function summary(_req: Request, res: Response): Promise<void> {
  res.json(analyticsStore.getSummary());
}
