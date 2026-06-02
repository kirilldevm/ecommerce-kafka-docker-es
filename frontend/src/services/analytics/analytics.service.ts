import { endpoints } from '@/config/endpoints.config';
import { apiClient } from '@/lib/api-client';
import type { AnalyticsSummary } from '@/types/analytics.types';

export class AnalyticsService {
  async getSummary(): Promise<AnalyticsSummary> {
    const { data } = await apiClient.get<AnalyticsSummary>(endpoints.analytics.summary);
    return data;
  }
}

export const analyticsService = new AnalyticsService();

