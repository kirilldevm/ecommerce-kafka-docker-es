function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3005),
  elasticsearchNode: requireEnv("ES_NODE"),
  elasticsearchIndex: process.env.ES_INDEX ?? "ecommerce",
  kafkaClientId: process.env.KAFKA_CLIENT_ID ?? "search-service",
} as const;
