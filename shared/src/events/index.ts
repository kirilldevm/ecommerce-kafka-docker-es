export {
  createDomainEvent,
  type DomainEvent,
} from "./types";

export {
  ORDER_EVENT_TYPES,
  type OrderCreatedEvent,
  type OrderCreatedPayload,
  type OrderEventType,
  type OrderItemSnapshot,
} from "./order.events";

export {
  PAYMENT_EVENT_TYPES,
  type PaymentEventType,
  type PaymentOutcome,
  type PaymentProcessedEvent,
  type PaymentProcessedPayload,
} from "./payment.events";

export {
  DELIVERY_EVENT_TYPES,
  type DeliveryEventType,
  type OrderStatusUpdatedEvent,
  type OrderStatusUpdatedPayload,
} from "./delivery.events";

export {
  PRODUCT_EVENT_TYPES,
  type ProductDeletedEvent,
  type ProductDeletedPayload,
  type ProductEventType,
  type ProductUpsertEvent,
  type ProductUpsertPayload,
} from "./product.events";
