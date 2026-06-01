import {
  createKafkaMetrics,
  createMetricsRegistry,
} from "@ecommerce/shared";
import { Counter, Gauge, Histogram } from "prom-client";

export const registry = createMetricsRegistry("analytics-service");
export const kafkaMetrics = createKafkaMetrics(registry);

export const ordersCreatedTotal = new Counter({
  name: "ecommerce_orders_created_total",
  help: "Total orders created",
  registers: [registry],
});

export const ordersDeliveredTotal = new Counter({
  name: "ecommerce_orders_delivered_total",
  help: "Total orders delivered",
  registers: [registry],
});

export const paymentsProcessedTotal = new Counter({
  name: "ecommerce_payments_processed_total",
  help: "Payment processing outcomes",
  labelNames: ["status"],
  registers: [registry],
});

export const revenueTotal = new Counter({
  name: "ecommerce_revenue_total",
  help: "Cumulative revenue from successful payments",
  registers: [registry],
});

export const ordersPerMinuteGauge = new Gauge({
  name: "ecommerce_orders_per_minute",
  help: "Orders created in the rolling window",
  registers: [registry],
});

export const paymentSuccessRateGauge = new Gauge({
  name: "ecommerce_payment_success_rate",
  help: "Ratio of successful payments to all processed payments",
  registers: [registry],
});

export const orderFulfillmentDuration = new Histogram({
  name: "ecommerce_order_fulfillment_duration_seconds",
  help: "Time from order creation to delivered status",
  registers: [registry],
  buckets: [1, 2, 5, 10, 15, 30, 60, 120, 300],
});

export function syncGaugeMetrics(summary: {
  ordersPerMinute: number;
  paymentSuccessRate: number;
}): void {
  ordersPerMinuteGauge.set(summary.ordersPerMinute);
  paymentSuccessRateGauge.set(summary.paymentSuccessRate);
}
