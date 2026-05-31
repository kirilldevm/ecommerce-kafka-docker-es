import { createApp } from "./app";
import { config } from "./config";
import { connectRedis, disconnectRedis } from "./redis";

async function main() {
  await connectRedis();

  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`auth-service listening on port ${config.port}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received, shutting down...`);
    server.close();
    await disconnectRedis();
    process.exit(0);
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((err) => {
  console.error("Failed to start auth-service:", err);
  process.exit(1);
});
