import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storageKeys } from '@/config/storage.config';
import { multiplyPrice } from '@/lib/format-price';
import type { CartLineItem, CreateOrderItem } from '@/types/order.types';
import type { Product } from '@/types/product.types';

interface CartState {
  items: CartLineItem[];

  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getOrderItems: () => CreateOrderItem[];
  syncStock: (products: Product[]) => void;
}

function toCartProduct(product: Product): CartLineItem['product'] {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock,
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        if (product.stock <= 0) {
          return;
        }

        const safeQuantity = Math.max(1, Math.floor(quantity));
        const existing = get().items.find((line) => line.productId === product.id);

        if (existing) {
          const nextQuantity = Math.min(existing.quantity + safeQuantity, product.stock);
          set({
            items: get().items.map((line) =>
              line.productId === product.id
                ? {
                    ...line,
                    quantity: nextQuantity,
                    product: toCartProduct(product),
                  }
                : line,
            ),
          });
          return;
        }

        set({
          items: [
            ...get().items,
            {
              productId: product.id,
              quantity: Math.min(safeQuantity, product.stock),
              product: toCartProduct(product),
            },
          ],
        });
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((line) => line.productId !== productId) });
      },

      setQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map((line) => {
            if (line.productId !== productId) {
              return line;
            }

            return {
              ...line,
              quantity: Math.min(Math.floor(quantity), line.product.stock),
            };
          }),
        });
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () =>
        get().items.reduce((count, line) => count + line.quantity, 0),

      getSubtotal: () =>
        get().items.reduce(
          (total, line) => total + multiplyPrice(line.product.price, line.quantity),
          0,
        ),

      getOrderItems: () =>
        get().items.map(({ productId, quantity }) => ({ productId, quantity })),

      syncStock: (products) => {
        const stockById = new Map(products.map((product) => [product.id, product]));

        set({
          items: get()
            .items.map((line) => {
              const product = stockById.get(line.productId);
              if (!product) {
                return null;
              }

              return {
                ...line,
                quantity: Math.min(line.quantity, product.stock),
                product: toCartProduct(product),
              };
            })
            .filter((line): line is CartLineItem => line !== null && line.quantity > 0),
        });
      },
    }),
    {
      name: storageKeys.cart,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
