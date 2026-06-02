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

