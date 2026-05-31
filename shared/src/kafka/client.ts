import { Kafka, type KafkaConfig as KafkaJsConfig } from 'kafkajs';
import { getKafkaConfig, type KafkaConfig } from './config';

export function createKafkaClient(config?: Partial<KafkaConfig>): Kafka {
  const resolved = getKafkaConfig(config);

  const kafkaConfig: KafkaJsConfig = {
    clientId: resolved.clientId,
    brokers: resolved.brokers,
  };

  return new Kafka(kafkaConfig);
}
