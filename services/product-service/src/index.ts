import { createApp } from "./app";
import { config } from "./config";
import { startProductKafka, stopProductKafka } from "./kafka";

async function main() {
  await startProductKafka();

  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`product-service listening on port ${config.port}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received, shutting down...`);
    server.close();
    await stopProductKafka();
    process.exit(0);
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((err) => {
  console.error("Failed to start product-service:", err);
  process.exit(1);
});
