export interface KafkaConfig {
  clientId: string;
  brokers: string[];
}

const DEFAULT_BROKERS = ['localhost:9092'];

export function getKafkaConfig(
  overrides: Partial<KafkaConfig> = {},
): KafkaConfig {
  const raw = process.env.KAFKA_BROKERS ?? process.env.KAFKA_BROKERS_DOCKER;

  const brokersFromEnv = raw
    ?.split(',')
    .map((b) => b.trim())
    .filter(Boolean);

  return {
    clientId:
      overrides.clientId ?? process.env.KAFKA_CLIENT_ID ?? 'ecommerce-service',
    brokers: overrides.brokers ?? brokersFromEnv ?? DEFAULT_BROKERS,
  };
}
