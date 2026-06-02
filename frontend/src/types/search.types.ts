import type { OrderStatus } from '@/types/order.types';

export type SearchOrder = {
  entityType: 'order';
  orderId: string;
  userId: string;
  status: OrderStatus;
  total: number;
  productNames: string[];
  createdAt: string;
  updatedAt: string;
};

export interface SearchOrdersResponse {
  items: SearchOrder[];
  total: number;
  page: number;
  limit: number;
}

