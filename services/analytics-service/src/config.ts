export const config = {
  port: Number(process.env.PORT ?? 3004),
  kafkaClientId: process.env.KAFKA_CLIENT_ID ?? "analytics-service",
  windowMs: Number(process.env.ANALYTICS_WINDOW_MS ?? 60_000),
} as const;
