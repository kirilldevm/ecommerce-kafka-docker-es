export const config = {
  port: Number(process.env.PORT ?? 3002),
  kafkaClientId: process.env.KAFKA_CLIENT_ID ?? 'payment-service',
  maxAttempts: Number(process.env.PAYMENT_MAX_ATTEMPTS ?? 3),
  retryDelayMs: Number(process.env.PAYMENT_RETRY_DELAY_MS ?? 1000),
  /** 0–1; 0 = always success */
  failureRate: Number(process.env.PAYMENT_FAILURE_RATE ?? 0),
} as const;
