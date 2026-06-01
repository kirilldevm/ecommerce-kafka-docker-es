export const routes = {
  home: '/',
  login: '/login',
  register: '/register',
  orders: '/orders',
  analytics: '/analytics',
  searchOrders: '/search',
  productSearch: '/product-search',
  adminProducts: '/products',
} as const;

export const authRoutes = [routes.login, routes.register] as const;

export type AppRoute = (typeof routes)[keyof typeof routes];

export function getDefaultRouteForRole(isAdmin: boolean): AppRoute {
  return isAdmin ? routes.orders : routes.home;
}
