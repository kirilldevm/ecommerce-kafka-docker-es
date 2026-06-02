import { endpoints } from '@/config/endpoints.config';
import { apiClient } from '@/lib/api-client';
import type {
  SearchOrdersResponse,
  SearchProductsResponse,
} from '@/types/search.types';
import type { OrderStatus } from '@/types/order.types';

export interface SearchProductsParams {
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  limit: number;
}

export interface SearchOrdersParams {
  q?: string;
  status?: OrderStatus;
  page: number;
  limit: number;
}

export class SearchService {
  async searchProducts(
    params: SearchProductsParams,
  ): Promise<SearchProductsResponse> {
    const { data } = await apiClient.get<SearchProductsResponse>(
      endpoints.search.products,
      {
        params: {
          q: params.q || undefined,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          page: params.page,
          limit: params.limit,
        },
      },
    );

    return data as SearchProductsResponse;
  }

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
