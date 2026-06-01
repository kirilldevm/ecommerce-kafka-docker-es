import cors from 'cors';
import type { Request, Response } from 'express';
import express from 'express';
import { config } from './config';
import { requireAdmin, requireAuth } from './middleware/auth';
import { errorHandler } from './middleware/error';
import {
  authProxy,
  createProtectedProxy,
  createPublicProxy,
} from './proxy/setup';

const productPublicProxy = createPublicProxy(config.productServiceUrl);
const productProtectedProxy = createProtectedProxy(config.productServiceUrl);
const orderProtectedProxy = createProtectedProxy(config.orderServiceUrl);
const searchPublicProxy = createPublicProxy(config.searchServiceUrl);
const searchProtectedProxy = createProtectedProxy(config.searchServiceUrl);
const analyticsProtectedProxy = createProtectedProxy(
  config.analyticsServiceUrl,
);

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || config.corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  );

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.use('/auth', express.json(), authProxy);

  app.get('/products', productPublicProxy);
  app.get('/products/:id', productPublicProxy);

  app.get('/search/products', searchPublicProxy);
  app.get('/search/orders', requireAuth, searchProtectedProxy);

  app.get(
    '/analytics/summary',
    requireAuth,
    requireAdmin,
    analyticsProtectedProxy,
  );

  app.post(
    '/products',
    requireAuth,
    requireAdmin,
    express.json(),
    productProtectedProxy,
  );
  app.put(
    '/products/:id',
    requireAuth,
    requireAdmin,
    express.json(),
    productProtectedProxy,
  );
  app.patch(
    '/products/:id',
    requireAuth,
    requireAdmin,
    express.json(),
    productProtectedProxy,
  );
  app.delete('/products/:id', requireAuth, requireAdmin, productProtectedProxy);

  app.get('/orders/stream', requireAuth, orderProtectedProxy);
  app.get('/orders', requireAuth, orderProtectedProxy);
  app.get('/orders/:id', requireAuth, orderProtectedProxy);
  app.post('/orders', requireAuth, express.json(), orderProtectedProxy);

  app.use(errorHandler);

  return app;
}
