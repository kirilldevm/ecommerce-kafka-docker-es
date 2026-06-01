import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { formatPrice, multiplyPrice } from '@/lib/format-price';
import { useCartStore } from '@/stores/cart/cart.store';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';

interface CartPanelProps {
  checkoutError: string | null;
  isCheckingOut: boolean;
  onCheckout: () => void;
}

export function CartPanel({ checkoutError, isCheckingOut, onCheckout }: CartPanelProps) {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getItemCount = useCartStore((state) => state.getItemCount);

  const itemCount = getItemCount();
  const subtotal = getSubtotal();

  return (
    <Card className="lg:sticky lg:top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="size-4" />
          Your cart
        </CardTitle>
        <CardDescription>
          {itemCount === 0
            ? 'Add products from the catalog to get started.'
            : `${itemCount} item${itemCount === 1 ? '' : 's'} ready to order`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            Your cart is empty.
          </p>
        ) : (
          <ul className="space-y-4">
            {items.map((line) => (
              <li key={line.productId} className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{line.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(line.product.price)} each
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${line.product.name}`}
                    onClick={() => removeItem(line.productId)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Decrease quantity"
                      disabled={line.quantity <= 1}
                      onClick={() => setQuantity(line.productId, line.quantity - 1)}
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      max={line.product.stock}
                      value={line.quantity}
                      className="h-8 w-16 text-center"
                      onChange={(event) => {
                        const next = Number.parseInt(event.target.value, 10);
                        if (!Number.isNaN(next)) {
                          setQuantity(line.productId, next);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Increase quantity"
                      disabled={line.quantity >= line.product.stock}
                      onClick={() => setQuantity(line.productId, line.quantity + 1)}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                  <p className="text-sm font-medium">
                    {formatPrice(multiplyPrice(line.product.price, line.quantity))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {checkoutError ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {checkoutError}
          </div>
        ) : null}
      </CardContent>

      {items.length > 0 ? (
        <CardFooter className="flex-col items-stretch gap-3">
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-base font-semibold">{formatPrice(subtotal)}</span>
          </div>
          <Button
            type="button"
            className="w-full"
            disabled={isCheckingOut}
            onClick={onCheckout}
          >
            {isCheckingOut ? 'Placing order...' : 'Place order'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full"
            disabled={isCheckingOut}
            onClick={clearCart}
          >
            Clear cart
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
