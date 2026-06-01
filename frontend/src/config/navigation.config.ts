import { routes } from '@/config/routes.config';

export type NavAudience = 'user' | 'admin';

export interface NavItem {
  path: string;
  label: string;
  audience: NavAudience[];
}

export const mainNavItems: NavItem[] = [
  { path: routes.home, label: 'Shop', audience: ['user'] },
  { path: routes.orders, label: 'Orders', audience: ['user', 'admin'] },
  { path: routes.productSearch, label: 'Find products', audience: ['user'] },
  { path: routes.searchOrders, label: 'Search orders', audience: ['admin'] },
  { path: routes.adminProducts, label: 'Products', audience: ['admin'] },
  { path: routes.analytics, label: 'Analytics', audience: ['admin'] },
];

export function getNavItemsForRole(isAdmin: boolean): NavItem[] {
  const audience: NavAudience = isAdmin ? 'admin' : 'user';
  return mainNavItems.filter((item) => item.audience.includes(audience));
}
