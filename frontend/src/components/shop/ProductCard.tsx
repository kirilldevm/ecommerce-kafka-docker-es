import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatPrice } from '@/lib/format-price';
import { useCartStore } from '@/stores/cart/cart.store';
import type { Product } from '@/types/product.types';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const cartQuantity = useCartStore(
    (state) => state.items.find((line) => line.productId === product.id)?.quantity ?? 0,
  );

  const inCart = cartQuantity > 0;
  const outOfStock = product.stock <= 0;
  const atMaxStock = inCart && cartQuantity >= product.stock;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        {product.description ? (
          <CardDescription className="line-clamp-2">{product.description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-lg font-semibold">{formatPrice(product.price)}</p>
        <p className="text-xs text-muted-foreground">
          {outOfStock ? 'Out of stock' : `${product.stock} in stock`}
        </p>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          className="w-full"
          disabled={outOfStock || atMaxStock}
          onClick={() => addItem(product)}
        >
          <ShoppingCart />
          {outOfStock ? 'Unavailable' : inCart ? 'Add more' : 'Add to cart'}
        </Button>
      </CardFooter>
    </Card>
  );
}
