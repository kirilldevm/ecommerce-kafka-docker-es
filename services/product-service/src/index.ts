import { createApp } from "./app";
import { config } from "./config";

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`product-service listening on port ${config.port}`);
});

const shutdown = (signal: string) => {
  console.log(`${signal} received, shutting down...`);
  server.close(() => process.exit(0));
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
