import { create } from 'zustand';
import { getApiErrorMessage } from '@/lib/api-error';
import { orderService } from '@/services/orders/order.service';
import type { Order } from '@/types/order.types';

interface OrdersState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  isStreamConnected: boolean;

  fetchOrders: () => Promise<void>;
  upsertOrder: (order: Order) => void;
  setStreamConnected: (connected: boolean) => void;
  clearError: () => void;
}

function sortOrders(orders: Order[]): Order[] {
  return [...orders].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,
  isStreamConnected: false,

  fetchOrders: async () => {
    set({ isLoading: true, error: null });

    try {
      const orders = await orderService.listOrders();
      set({ orders: sortOrders(orders), isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getApiErrorMessage(error, 'Failed to load orders'),
      });
    }
  },

  upsertOrder: (order) => {
    const existingIndex = get().orders.findIndex((item) => item.id === order.id);

    if (existingIndex === -1) {
      set({ orders: sortOrders([order, ...get().orders]) });
      return;
    }

    const nextOrders = [...get().orders];
    nextOrders[existingIndex] = order;
    set({ orders: sortOrders(nextOrders) });
  },

  setStreamConnected: (connected) => set({ isStreamConnected: connected }),
  clearError: () => set({ error: null }),
}));
