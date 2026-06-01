import type { Request, Response } from 'express';
import express from 'express';
import { errorHandler } from './middleware/error';
import { authProxy } from './proxy/setup';

export function createApp() {
  const app = express();

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.use('/auth', express.json(), authProxy);

  app.use(errorHandler);

  return app;
}
