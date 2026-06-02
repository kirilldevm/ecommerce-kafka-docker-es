import { ProductCatalogGrid } from '@/components/shop/ProductCatalogGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { searchService } from '@/services/search/search.service';
import type { Product } from '@/types/product.types';
import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';

const limit = 12;
const debounceMs = 400;

function toProduct(raw: {
  productId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}): Product {
  return {
    id: raw.productId,
    name: raw.name,
    description: raw.description || null,
    price: raw.price.toString(),
    stock: raw.stock,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function ProductSearchPage() {
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q.trim());
      setPage(1);
    }, debounceMs);
    return () => clearTimeout(t);
  }, [q]);

  const parsedMin = useMemo(() => {
    if (!minPrice.trim()) {
      return undefined;
    }
    const value = Number(minPrice);
    return Number.isFinite(value) ? value : undefined;
  }, [minPrice]);

  const parsedMax = useMemo(() => {
    if (!maxPrice.trim()) {
      return undefined;
    }
    const value = Number(maxPrice);
    return Number.isFinite(value) ? value : undefined;
  }, [maxPrice]);

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await searchService.searchProducts({
          q: debouncedQ || undefined,
          minPrice: parsedMin,
          maxPrice: parsedMax,
          page,
          limit,
        });

        setProducts(response.items.map(toProduct));
        setTotal(response.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search products');
      } finally {
        setIsLoading(false);
      }
    };

    void run();
  }, [debouncedQ, parsedMin, parsedMax, page, reloadKey]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Find products</h1>
        <p className="text-sm text-muted-foreground">
          Search products by text and price range, then add directly to cart.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-4 md:items-end">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Query</label>
              <Input
                value={q}
                placeholder="e.g. phone, laptop, headphones"
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Min price</label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={minPrice}
                placeholder="0"
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Max price</label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={maxPrice}
                placeholder="9999"
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              {total ? `${total} result${total === 1 ? '' : 's'}` : 'No results yet'}
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => {
                setPage(1);
                setReloadKey((k) => k + 1);
              }}
            >
              {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProductCatalogGrid
        products={products}
        isLoading={isLoading}
        error={error}
        onRetry={() => setReloadKey((k) => k + 1)}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Page <span className="font-medium text-foreground">{page}</span> of{' '}
          <span className="font-medium text-foreground">{totalPages}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading || page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading || page >= totalPages}
            onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

