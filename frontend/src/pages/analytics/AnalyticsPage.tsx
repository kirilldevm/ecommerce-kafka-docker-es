import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/format-date';
import { formatPrice } from '@/lib/format-price';
import { getApiErrorMessage } from '@/lib/api-error';
import { analyticsService } from '@/services/analytics/analytics.service';
import type { AnalyticsSummary } from '@/types/analytics.types';
import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const initialSummary: AnalyticsSummary = {
  orders: { total: 0, perMinute: 0, delivered: 0 },
  revenue: { total: 0 },
  payments: { success: 0, failed: 0, successRate: 0 },
  processing: { averageSeconds: 0, sampleCount: 0 },
  generatedAt: new Date(0).toISOString(),
};

function KpiCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">{description}</CardContent>
    </Card>
  );
}

export function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary>(initialSummary);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getSummary();
      setSummary(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load analytics summary'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSummary();
  }, []);

  const paymentChartData = useMemo(
    () => [
      { name: 'Success', value: summary.payments.success },
      { name: 'Failed', value: summary.payments.failed },
    ],
    [summary],
  );

  const orderChartData = useMemo(
    () => [
      { name: 'Created', value: summary.orders.total },
      { name: 'Delivered', value: summary.orders.delivered },
      { name: 'Per min', value: summary.orders.perMinute },
    ],
    [summary],
  );

  const successRatePct = Math.round(summary.payments.successRate * 1000) / 10;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time KPI summary from the analytics service.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" disabled={isLoading} onClick={() => void loadSummary()}>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {error ? (
        <Card>
          <CardContent className="pt-6">
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Orders total"
          value={summary.orders.total.toString()}
          description="All tracked created orders"
        />
        <KpiCard
          title="Orders per minute"
          value={summary.orders.perMinute.toString()}
          description="Recent activity window"
        />
        <KpiCard
          title="Revenue"
          value={formatPrice(summary.revenue.total)}
          description="From successful payments"
        />
        <KpiCard
          title="Avg fulfillment"
          value={`${summary.processing.averageSeconds}s`}
          description={`${summary.processing.sampleCount} delivered samples`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Orders Snapshot</CardTitle>
            <CardDescription>Created, delivered, and current per-minute rate</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="var(--color-primary, #3b82f6)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
            <CardDescription>{successRatePct}% success rate</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie data={paymentChartData} dataKey="value" nameKey="name" outerRadius={100} label />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Last updated: {formatDateTime(summary.generatedAt)}
      </p>
    </div>
  );
}

