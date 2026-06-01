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
