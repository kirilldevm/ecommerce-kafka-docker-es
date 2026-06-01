export const config = {
  port: Number(process.env.PORT ?? 3001),
  kafkaClientId: process.env.KAFKA_CLIENT_ID ?? "order-service",
} as const;
