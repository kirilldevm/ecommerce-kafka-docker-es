import { createApp } from "./app";
import { bootstrapFromDatabase } from "./bootstrap";
import { config } from "./config";
import {
  startAnalyticsConsumer,
  stopAnalyticsConsumer,
} from "./analytics.processor";

async function main() {
  await bootstrapFromDatabase();
  await startAnalyticsConsumer();

  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`analytics-service listening on port ${config.port}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received, shutting down...`);
    server.close();
    await stopAnalyticsConsumer();
    process.exit(0);
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((err) => {
  console.error("Failed to start analytics-service:", err);
  process.exit(1);
});
