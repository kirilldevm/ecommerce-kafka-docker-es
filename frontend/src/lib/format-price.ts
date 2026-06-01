export function formatPrice(value: string | number): string {
  const amount = typeof value === 'string' ? Number.parseFloat(value) : value;

  if (Number.isNaN(amount)) {
    return '$0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function multiplyPrice(price: string, quantity: number): number {
  return Number.parseFloat(price) * quantity;
}
