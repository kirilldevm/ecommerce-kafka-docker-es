import express from "express";
import { config } from "./config";
import {
  startDeliveryConsumer,
  stopDeliveryConsumer,
} from "./consumers/delivery.consumer";

async function main() {
  const producer = await startDeliveryConsumer();

  const app = express();

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  const server = app.listen(config.port, () => {
    console.log(`delivery-service listening on port ${config.port}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received, shutting down...`);
    server.close();
    await stopDeliveryConsumer(producer);
    process.exit(0);
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((err) => {
  console.error("Failed to start delivery-service:", err);
  process.exit(1);
});
