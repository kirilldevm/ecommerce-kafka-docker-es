import { OrderStatus } from "@prisma/client";
import { config } from "./config";
import {
  orderFulfillmentDuration,
  ordersCreatedTotal,
  ordersDeliveredTotal,
  paymentsProcessedTotal,
  revenueTotal,
  syncGaugeMetrics,
} from "./metrics";

interface TrackedOrder {
  createdAt: number;
  total: number;
  revenueCounted: boolean;
  delivered: boolean;
}

export interface AnalyticsSummary {
  orders: {
    total: number;
    perMinute: number;
    delivered: number;
  };
  revenue: {
    total: number;
  };
  payments: {
    success: number;
    failed: number;
    successRate: number;
  };
  processing: {
    averageSeconds: number;
    sampleCount: number;
  };
  generatedAt: string;
}

class AnalyticsStore {
  private orders = new Map<string, TrackedOrder>();
  private recentOrderTimestamps: number[] = [];
  private ordersCreated = 0;
  private ordersDelivered = 0;
  private paymentSuccess = 0;
  private paymentFailed = 0;
  private revenue = 0;
  private fulfillmentDurations: number[] = [];

  private pruneWindow(now = Date.now()): void {
    const cutoff = now - config.windowMs;
    this.recentOrderTimestamps = this.recentOrderTimestamps.filter(
      (ts) => ts >= cutoff,
    );
  }

  private refreshGauges(): void {
    const summary = this.getSummary();
    syncGaugeMetrics({
      ordersPerMinute: summary.orders.perMinute,
      paymentSuccessRate: summary.payments.successRate,
    });
  }

  recordOrderCreated(orderId: string, total: number, createdAt = Date.now()): void {
    if (this.orders.has(orderId)) {
      return;
    }

    this.orders.set(orderId, {
      createdAt,
      total,
      revenueCounted: false,
      delivered: false,
    });

    this.ordersCreated += 1;
    this.recentOrderTimestamps.push(createdAt);
    this.pruneWindow(createdAt);

    ordersCreatedTotal.inc();
    this.refreshGauges();
  }

  recordPaymentSuccess(orderId: string): void {
    const tracked = this.orders.get(orderId);
    if (!tracked || tracked.revenueCounted) {
      if (!tracked) {
        this.paymentSuccess += 1;
        paymentsProcessedTotal.inc({ status: "SUCCESS" });
        this.refreshGauges();
      }
      return;
    }

    tracked.revenueCounted = true;
    this.revenue += tracked.total;
    this.paymentSuccess += 1;

    revenueTotal.inc(tracked.total);
    paymentsProcessedTotal.inc({ status: "SUCCESS" });
    this.refreshGauges();
  }

  recordPaymentFailed(orderId: string): void {
    this.paymentFailed += 1;
    paymentsProcessedTotal.inc({ status: "FAILED" });
    this.orders.get(orderId);
    this.refreshGauges();
  }

  recordOrderDelivered(orderId: string, deliveredAt = Date.now()): void {
    const tracked = this.orders.get(orderId);
    if (!tracked || tracked.delivered) {
      return;
    }

    tracked.delivered = true;
    this.ordersDelivered += 1;

    const durationSec = (deliveredAt - tracked.createdAt) / 1000;
    if (durationSec >= 0) {
      this.fulfillmentDurations.push(durationSec);
      orderFulfillmentDuration.observe(durationSec);
    }

    ordersDeliveredTotal.inc();
    this.refreshGauges();
  }

  seedOrder(params: {
    orderId: string;
    total: number;
    createdAt: number;
    deliveredAt?: number;
    status: OrderStatus;
    paymentSucceeded: boolean;
  }): void {
    this.recordOrderCreated(params.orderId, params.total, params.createdAt);

    if (params.paymentSucceeded) {
      this.recordPaymentSuccess(params.orderId);
    }

    if (params.status === OrderStatus.DELIVERED) {
      this.recordOrderDelivered(
        params.orderId,
        params.deliveredAt ?? params.createdAt,
      );
    }
  }

  getSummary(): AnalyticsSummary {
    this.pruneWindow();

    const paymentTotal = this.paymentSuccess + this.paymentFailed;
    const avgDuration =
      this.fulfillmentDurations.length > 0
        ? this.fulfillmentDurations.reduce((a, b) => a + b, 0) /
          this.fulfillmentDurations.length
        : 0;

    return {
      orders: {
        total: this.ordersCreated,
        perMinute: this.recentOrderTimestamps.length,
        delivered: this.ordersDelivered,
      },
      revenue: {
        total: Math.round(this.revenue * 100) / 100,
      },
      payments: {
        success: this.paymentSuccess,
        failed: this.paymentFailed,
        successRate:
          paymentTotal > 0 ? Math.round((this.paymentSuccess / paymentTotal) * 1000) / 1000 : 0,
      },
      processing: {
        averageSeconds: Math.round(avgDuration * 100) / 100,
        sampleCount: this.fulfillmentDurations.length,
      },
      generatedAt: new Date().toISOString(),
    };
  }
}

export const analyticsStore = new AnalyticsStore();
