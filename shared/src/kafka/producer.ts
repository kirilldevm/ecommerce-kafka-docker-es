import type { Producer } from 'kafkajs';
import type { DomainEvent } from '../events';
import { createKafkaClient } from './client';
import { serializeEvent } from './message';
import type { Topic } from './topics';

export interface PublishOptions {
  key?: string;
  headers?: Record<string, string>;
}

/**
 * Connects and returns a ready-to-use Kafka producer.
 * Call `producer.disconnect()` on graceful shutdown.
 */
export async function createProducer(clientId?: string): Promise<Producer> {
  const kafka = createKafkaClient(clientId ? { clientId } : undefined);
  const producer = kafka.producer();
  await producer.connect();
  return producer;
}

export async function publishEvent<TType extends string, TPayload>(
  producer: Producer,
  topic: Topic,
  event: DomainEvent<TType, TPayload>,
  options: PublishOptions = {},
): Promise<void> {
  await producer.send({
    topic,
    messages: [
      {
        key: options.key,
        value: serializeEvent(event),
        headers: options.headers,
      },
    ],
  });
}
