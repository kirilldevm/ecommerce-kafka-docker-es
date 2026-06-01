import type { Request, Response } from "express";
import type { Producer } from "kafkajs";
import { asyncHandler } from "./middleware";
import {
  createOrder,
  getOrderById,
  listOrdersForUser,
  validateCreateOrderBody,
} from "./order.service";
import { addSseClient } from "./sse";

export function createRoutes(producer: Producer) {
  const list = asyncHandler(async (req, res) => {
    const isAdmin = req.user?.role === "ADMIN";
    const orders = await listOrdersForUser(req.user!.id, isAdmin);
    res.json({ orders });
  });

  const getById = asyncHandler(async (req, res) => {
    const isAdmin = req.user?.role === "ADMIN";
    const order = await getOrderById(req.params.id, req.user!.id, isAdmin);
    res.json({ order });
  });

  const create = asyncHandler(async (req, res) => {
    const items = validateCreateOrderBody(req.body);
    const order = await createOrder(req.user!.id, items, producer);
    res.status(201).json({ order });
  });

  const stream = (_req: Request, res: Response): void => {
    addSseClient(res);
  };

  return { list, getById, create, stream };
}

export function health(_req: Request, res: Response): void {
  res.json({ status: "ok" });
}
