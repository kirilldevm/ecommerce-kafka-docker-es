export const config = {
  port: Number(process.env.PORT ?? 3003),
  kafkaClientId: process.env.KAFKA_CLIENT_ID ?? "delivery-service",
  /** Delay between PREPARING → SHIPPED → DELIVERED */
  stageDelayMs: Number(process.env.DELIVERY_STAGE_DELAY_MS ?? 2000),
} as const;
