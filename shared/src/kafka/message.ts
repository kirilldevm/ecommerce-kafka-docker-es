import type { DomainEvent } from '../events';

export function serializeEvent<TType extends string, TPayload>(
  event: DomainEvent<TType, TPayload>,
): string {
  return JSON.stringify(event);
}

export function parseEvent<TType extends string, TPayload>(
  value: Buffer | null,
): DomainEvent<TType, TPayload> {
  if (!value || value.length === 0) {
    throw new Error('Kafka message value is empty');
  }

  const parsed = JSON.parse(value.toString('utf8')) as DomainEvent<
    TType,
    TPayload
  >;

  if (!parsed.eventType || !parsed.timestamp || parsed.payload === undefined) {
    throw new Error('Invalid domain event shape');
  }

  return parsed;
}
