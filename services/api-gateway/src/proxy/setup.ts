import type { Request } from 'express';
import type { ClientRequest } from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from '../config';
import { attachUserHeaders } from '../middleware/auth';

/** no JWT required. */
export const authProxy = createProxyMiddleware({
  target: config.authServiceUrl,
  changeOrigin: true,
  pathRewrite: { '^/auth': '' },
  on: {
    proxyReq: (proxyReq: ClientRequest, req: Request) => {
      if (req.body && Object.keys(req.body).length > 0) {
        const body = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(body));
        proxyReq.write(body);
      }
    },
  },
});

export function createProtectedProxy(target: string) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    on: {
      proxyReq: (proxyReq: ClientRequest, req: Request) => {
        attachUserHeaders(req);
        proxyReq.removeHeader('authorization');

        if (req.user) {
          proxyReq.setHeader('x-user-id', req.user.sub);
          proxyReq.setHeader('x-user-email', req.user.email);
          proxyReq.setHeader('x-user-role', req.user.role);
        }

        if (req.body && Object.keys(req.body).length > 0) {
          const body = JSON.stringify(req.body);
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(body));
          proxyReq.write(body);
        }
      },
    },
  });
}
