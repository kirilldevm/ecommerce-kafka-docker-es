import type { Consumer, EachMessagePayload } from 'kafkajs';
import { createKafkaClient } from './client';
import type { Topic } from './topics';

export type MessageHandler = (payload: EachMessagePayload) => Promise<void>;

export interface ConsumerOptions {
  groupId: string;
  clientId?: string;
  fromBeginning?: boolean;
}

export async function runConsumer(
  topics: Topic[],
  handler: MessageHandler,
  options: ConsumerOptions,
): Promise<Consumer> {
  const kafka = createKafkaClient(
    options.clientId ? { clientId: options.clientId } : undefined,
  );
  const consumer = kafka.consumer({ groupId: options.groupId });

  await consumer.connect();
  await consumer.subscribe({
    topics: [...topics],
    fromBeginning: options.fromBeginning ?? false,
  });

  await consumer.run({
    eachMessage: async (payload) => {
      await handler(payload);
    },
  });

  return consumer;
}

/**
 * Connects a consumer without starting the run loop (for custom run logic).
 */
export async function createConsumer(
  options: ConsumerOptions,
): Promise<Consumer> {
  const kafka = createKafkaClient(
    options.clientId ? { clientId: options.clientId } : undefined,
  );
  const consumer = kafka.consumer({ groupId: options.groupId });
  await consumer.connect();
  return consumer;
}
