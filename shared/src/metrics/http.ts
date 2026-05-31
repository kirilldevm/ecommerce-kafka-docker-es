import { Counter, Histogram, type Registry } from 'prom-client';

export interface HttpMetrics {
  requestDuration: Histogram<'method' | 'route' | 'status_code'>;
  requestTotal: Counter<'method' | 'route' | 'status_code'>;
}

export function createHttpMetrics(registry: Registry): HttpMetrics {
  const requestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    registers: [registry],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  });

  const requestTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [registry],
  });

  return { requestDuration, requestTotal };
}

export interface MetricsResponse {
  setHeader(name: string, value: string): void;
  end(body: string): void;
}

/**
 * Handler for `GET /metrics` — Prometheus scrapes this endpoint.
 */
export function createMetricsHandler(registry: Registry) {
  return async (_req: unknown, res: MetricsResponse): Promise<void> => {
    res.setHeader('Content-Type', registry.contentType);
    res.end(await registry.metrics());
  };
}
