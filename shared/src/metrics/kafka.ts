import { Counter, type Registry } from 'prom-client';

export interface KafkaMetrics {
  messagesPublished: Counter<'topic'>;
  messagesConsumed: Counter<'topic' | 'status'>;
  consumeErrors: Counter<'topic'>;
}

export function createKafkaMetrics(registry: Registry): KafkaMetrics {
  const messagesPublished = new Counter({
    name: 'kafka_messages_published_total',
    help: 'Total messages published to Kafka',
    labelNames: ['topic'],
    registers: [registry],
  });

  const messagesConsumed = new Counter({
    name: 'kafka_messages_consumed_total',
    help: 'Total messages consumed from Kafka',
    labelNames: ['topic', 'status'],
    registers: [registry],
  });

  const consumeErrors = new Counter({
    name: 'kafka_consume_errors_total',
    help: 'Total Kafka consumer handler errors',
    labelNames: ['topic'],
    registers: [registry],
  });

  return { messagesPublished, messagesConsumed, consumeErrors };
}
