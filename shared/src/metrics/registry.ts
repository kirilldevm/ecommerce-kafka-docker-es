import { collectDefaultMetrics, Registry } from 'prom-client';

/**
 * Creates an isolated Prometheus registry for one microservice.
 * Default labels (e.g. service name) are attached to every metric.
 */
export function createMetricsRegistry(serviceName: string): Registry {
  const registry = new Registry();
  registry.setDefaultLabels({ service: serviceName });

  collectDefaultMetrics({
    register: registry,
    prefix: 'nodejs_',
  });

  return registry;
}

export async function getMetricsSnapshot(registry: Registry): Promise<string> {
  return registry.metrics();
}
