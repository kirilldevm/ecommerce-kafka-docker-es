import { endpoints } from '@/config/endpoints.config';
import { apiClient } from '@/lib/api-client';
import type {
  CreateOrderRequest,
  CreateOrderResponse,
} from '@/types/order.types';

export class OrderService {
  async createOrder(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
    const { data } = await apiClient.post<CreateOrderResponse>(
      endpoints.orders.create,
      payload,
    );
    return data;
  }
}

export const orderService = new OrderService();
