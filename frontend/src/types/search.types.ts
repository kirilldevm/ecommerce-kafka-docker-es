import type { OrderStatus } from '@/types/order.types';

export type SearchProduct = {
  entityType: 'product';
  productId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
};

export interface SearchProductsResponse {
  items: SearchProduct[];
  total: number;
  page: number;
  limit: number;
}

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

