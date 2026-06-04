import express from "express";
import { config } from "./config";
import {
  startPaymentConsumer,
  stopPaymentConsumer,
} from "./consumers/payment.consumer";

async function main() {
  const producer = await startPaymentConsumer();

  const app = express();

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  const server = app.listen(config.port, () => {
    console.log(`payment-service listening on port ${config.port}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received, shutting down...`);
    server.close();
    await stopPaymentConsumer(producer);
    process.exit(0);
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((err) => {
  console.error("Failed to start payment-service:", err);
  process.exit(1);
});
