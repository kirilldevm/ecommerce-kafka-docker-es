import { createApp } from "./app";
import { config } from "./config";
import { ensureSearchIndex } from "./elasticsearch";
import {
  syncCatalogFromDatabase,
  syncOrdersFromDatabase,
} from "./indexer";
import {
  startSearchConsumer,
  stopSearchConsumer,
} from "./consumers/search.consumer";

async function main() {
  await ensureSearchIndex();
  await syncCatalogFromDatabase();
  await syncOrdersFromDatabase();
  await startSearchConsumer();

  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`search-service listening on port ${config.port}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received, shutting down...`);
    server.close();
    await stopSearchConsumer();
    process.exit(0);
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((err) => {
  console.error("Failed to start search-service:", err);
  process.exit(1);
});
