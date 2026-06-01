import type { Product } from '@/types/product.types';

export type OrderStatus =
  | 'PENDING'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'PAYMENT_FAILED'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItemProduct {
  id: string;
  name: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  product?: OrderItemProduct;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  total: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  items: CreateOrderItem[];
}

export interface CreateOrderResponse {
  order: Order;
}

export interface OrdersListResponse {
  orders: Order[];
}

export type OrderStreamEventType = 'connected' | 'order.created' | 'order.status.updated';

export interface OrderStreamEvent {
  type: OrderStreamEventType;
  order?: Order;
}

export interface CartLineItem {
  productId: string;
  quantity: number;
  product: Pick<Product, 'id' | 'name' | 'price' | 'stock'>;
}
