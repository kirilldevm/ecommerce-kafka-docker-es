export interface DomainEvent<TType extends string, TPayload> {
  eventType: TType;
  timestamp: string;
  payload: TPayload;
}

export function createDomainEvent<TType extends string, TPayload>(
  eventType: TType,
  payload: TPayload,
): DomainEvent<TType, TPayload> {
  return {
    eventType,
    timestamp: new Date().toISOString(),
    payload,
  };
}
