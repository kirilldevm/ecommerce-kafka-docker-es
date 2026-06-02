# Frontend

Frontend for the Kafka e-commerce app (React + TypeScript + Vite).

For full setup and project documentation, see the root [`README.md`](../README.md).

## Local Commands

From repo root:

```bash
npm run dev:frontend
npm run build -w @ecommerce/frontend
```

## Docker Runtime

- Production-like frontend runtime uses `frontend/Dockerfile` + `frontend/nginx.conf`.
- In compose, the app is served by Nginx on `http://localhost:${FRONTEND_PORT}` (default `80`).
- API calls are proxied through `/api/*` to `api-gateway:8000`.
