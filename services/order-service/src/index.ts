import { createProducer } from "@ecommerce/shared";
import { createApp } from "./app";
import { config } from "./config";
import { startKafkaConsumers, stopKafkaConsumers } from "./kafka.handlers";

async function main() {
  const producer = await createProducer(config.kafkaClientId);
  await startKafkaConsumers();

  const app = createApp(producer);

  const server = app.listen(config.port, () => {
    console.log(`order-service listening on port ${config.port}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received, shutting down...`);
    server.close();
    await stopKafkaConsumers();
    await producer.disconnect();
    process.exit(0);
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((err) => {
  console.error("Failed to start order-service:", err);
  process.exit(1);
});
