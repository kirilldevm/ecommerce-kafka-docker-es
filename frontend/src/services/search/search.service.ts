import { endpoints } from '@/config/endpoints.config';
import { apiClient } from '@/lib/api-client';
import type { SearchOrdersResponse } from '@/types/search.types';
import type { OrderStatus } from '@/types/order.types';

export interface SearchOrdersParams {
  q?: string;
  status?: OrderStatus;
  page: number;
  limit: number;
}

export class SearchService {
  async searchOrders(
    params: SearchOrdersParams,
  ): Promise<SearchOrdersResponse> {
    const { data } = await apiClient.get<SearchOrdersResponse>(
      endpoints.search.orders,
      {
        params: {
          q: params.q || undefined,
          status: params.status || undefined,
          page: params.page,
          limit: params.limit,
        },
      },
    );

    return data as SearchOrdersResponse;
  }
}

export const searchService = new SearchService();
