import type { Response } from "express";

const clients = new Set<Response>();

export function addSseClient(res: Response): void {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  clients.add(res);

  res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

  res.on("close", () => {
    clients.delete(res);
  });
}

export function broadcastOrderEvent(
  type: string,
  payload: Record<string, unknown>,
): void {
  const message = `data: ${JSON.stringify({ type, ...payload })}\n\n`;

  for (const client of clients) {
    client.write(message);
  }
}
