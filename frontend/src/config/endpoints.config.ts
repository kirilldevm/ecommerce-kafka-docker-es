export const endpoints = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  products: {
    list: '/products',
    byId: (id: string) => `/products/${id}`,
  },
  search: {
    products: '/search/products',
    orders: '/search/orders',
  },
  analytics: {
    summary: '/analytics/summary',
  },
  orders: {
    list: '/orders',
    create: '/orders',
    byId: (id: string) => `/orders/${id}`,
    stream: '/orders/stream',
  },
} as const;
