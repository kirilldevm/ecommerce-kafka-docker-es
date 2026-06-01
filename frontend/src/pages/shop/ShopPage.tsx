import { CartPanel } from '@/components/shop/CartPanel';
import { ProductCatalogGrid } from '@/components/shop/ProductCatalogGrid';
import { routes } from '@/config/routes.config';
import { getApiErrorMessage } from '@/lib/api-error';
import { orderService } from '@/services/orders/order.service';
import { productService } from '@/services/products/product.service';
import { useCartStore } from '@/stores/cart/cart.store';
import type { Product } from '@/types/product.types';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function ShopPage() {
  const navigate = useNavigate();
  const syncStock = useCartStore((state) => state.syncStock);
  const getOrderItems = useCartStore((state) => state.getOrderItems);
  const clearCart = useCartStore((state) => state.clearCart);
  const items = useCartStore((state) => state.items);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const nextProducts = await productService.listProducts();
      setProducts(nextProducts);
      syncStock(nextProducts);
    } catch (error) {
      setLoadError(getApiErrorMessage(error, 'Failed to load products'));
    } finally {
      setIsLoading(false);
    }
  }, [syncStock]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const handleCheckout = async () => {
    if (items.length === 0) {
      return;
    }

    setCheckoutError(null);
    setIsCheckingOut(true);

    try {
      await orderService.createOrder({ items: getOrderItems() });
      clearCart();
      navigate(routes.orders, { replace: true });
    } catch (error) {
      setCheckoutError(getApiErrorMessage(error, 'Failed to place order'));
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Shop</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Browse the catalog, add items to your cart, and place an order.
        </p>
      </div>

      <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start'>
        <ProductCatalogGrid
          products={products}
          isLoading={isLoading}
          error={loadError}
          onRetry={() => void loadProducts()}
        />
        <CartPanel
          checkoutError={checkoutError}
          isCheckingOut={isCheckingOut}
          onCheckout={() => void handleCheckout()}
        />
      </div>
    </div>
  );
}
