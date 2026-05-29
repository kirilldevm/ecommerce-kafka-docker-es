# Service Cards: Roles and Inputs/Outputs

## API Gateway
- Role: Single entry point for clients; validates JWT; routes requests to internal services.
- Inputs:
  - HTTP requests from frontend/clients.
  - Access tokens from `Authorization` header.
- Outputs:
  - Routed HTTP requests to `Auth`, `Product`, `Order`, `Search`, `Analytics`.
  - Forwarded `x-user-*` headers with authenticated user context.
  - HTTP responses to clients.

## Auth Service
- Role: Handles registration, login, refresh, logout, and role-aware identity management (`user`, `admin`).
- Inputs:
  - Auth-related HTTP requests from `API Gateway`.
  - Credentials and refresh tokens from clients.
- Outputs:
  - JWT access tokens and refresh tokens.
  - User identity/role payload used by `API Gateway`.
  - Refresh token records in `Redis`.

## Product Service
- Role: Source of truth for product catalog and admin-managed CRUD operations.
- Inputs:
  - Product API requests from `API Gateway`.
  - User context headers for role checks (`admin` for writes).
- Outputs:
  - Product data via HTTP API for browsing and order creation.
  - Persisted catalog updates in the service database.

## Order Service
- Role: Accepts order creation, owns order state, emits lifecycle events, and exposes realtime updates (SSE).
- Inputs:
  - Order HTTP requests from `API Gateway`.
  - Status update events from Kafka (for example `payment.processed`, `order.status.updated`).
- Outputs:
  - Kafka event `order.created`.
  - Order state updates in its own storage.
  - HTTP + SSE responses for clients/admin dashboards.

## Payment Service
- Role: Consumes new orders, simulates/processes payment, applies retry/backoff, and sends failed events to DLQ.
- Inputs:
  - Kafka events from `orders` topic (created orders).
- Outputs:
  - Kafka event `payment.processed` (SUCCESS/FAILED).
  - Dead-letter events to payment DLQ for unrecoverable failures.
  - Internal payment attempt metrics/logs.

## Delivery Service
- Role: Continues order lifecycle after successful payment (`PREPARING -> SHIPPED -> DELIVERED`).
- Inputs:
  - Kafka payment success events.
  - Existing order identifiers and current order state.
- Outputs:
  - Kafka event `order.status.updated`.
  - Delivery status progression persisted in service storage.

## Search Service
- Role: Builds and serves denormalized search index for fast filtering and lookup.
- Inputs:
  - Kafka events from key business topics (`order.created`, `payment.processed`, `order.status.updated`, product updates).
  - Search/filter HTTP requests from `API Gateway`.
- Outputs:
  - Upserts to `Elasticsearch` index.
  - Fast search API responses for frontend/admin.

## Analytics Service
- Role: Computes near-realtime operational KPIs (orders/min, revenue, success rate, processing time).
- Inputs:
  - Kafka event streams from order/payment/delivery flow.
  - Optional HTTP requests for reporting endpoints.
- Outputs:
  - Aggregated KPI data via API.
  - Metrics endpoint (`/metrics`) for `Prometheus`.

## Kafka + Zookeeper
- Role: Event backbone and broker coordination for asynchronous microservice communication.
- Inputs:
  - Produced events from domain services (`Order`, `Payment`, `Delivery`, others).
  - Consumer group subscriptions from downstream services.
- Outputs:
  - Durable ordered event streams by topic.
  - Delivery of events to subscribed consumers.

## Redis
- Role: Low-latency storage for refresh tokens and short-lived/session-like data.
- Inputs:
  - Token/session writes from `Auth Service`.
- Outputs:
  - Fast token lookups, refresh validation, and revocation checks.

## Prometheus + Grafana
- Role: Observability stack for metrics collection, dashboards, and alerting.
- Inputs:
  - Metrics scraped from services (for example `Analytics`, `Payment`, `Order`).
- Outputs:
  - Time-series metrics in Prometheus.
  - Visual dashboards and alerts in Grafana.

## Elasticsearch + Kibana
- Role: Search and operational analytics interface for indexed documents/events.
- Inputs:
  - Indexed/upserted documents from `Search Service` (and optionally logs).
- Outputs:
  - Query results from Elasticsearch.
  - Operational exploration and dashboards in Kibana.
