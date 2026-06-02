# Kafka E-Commerce Docker App

Event-driven e-commerce platform built with microservices, Kafka, Docker Compose, and a React frontend.

## Stack

- Backend: Node.js + TypeScript microservices
- API gateway: Express + proxy + JWT auth
- Database: PostgreSQL (Prisma)
- Messaging: Kafka + Zookeeper
- Cache/session: Redis (refresh tokens)
- Search: Elasticsearch + Kibana
- Observability: Prometheus + Grafana
- Frontend: React + TypeScript + Vite + Zustand + Formik/Yup + Recharts

## Services and Ports

- Frontend (Nginx via Docker): `http://localhost` (port `${FRONTEND_PORT}`, default `80`)
- API Gateway: `http://localhost:8000`
- Frontend (Vite dev mode): `http://localhost:5173`
- Auth Service: `http://localhost:3006`
- Product Service: `http://localhost:3007`
- Order Service: `http://localhost:3001`
- Payment Service: `http://localhost:3002`
- Delivery Service: `http://localhost:3003`
- Search Service: `http://localhost:3005`
- Analytics Service: `http://localhost:3004`
- Grafana: `http://localhost:3000`
- Prometheus: `http://localhost:9090`
- Kibana: `http://localhost:5601`

## Quick Start

1. Install deps at repo root:

```bash
npm install
```

2. Create root env file:

```bash
cp .env.example .env
```

3. Start infrastructure and services (includes frontend Nginx container):

```bash
npm run compose:up
```

4. Optional: run frontend in local dev mode instead of Nginx:

```bash
npm run dev:frontend
```

When running in Docker, frontend calls API through same-origin proxy:
- Browser requests `/api/*`
- Nginx forwards to `api-gateway:8000` (and handles `/api/orders/stream` SSE without buffering)

## Demo Credentials

- Admin user:
  - Email: `admin@gmail.com`
  - Password: `adminadmin`

## Seed Demo Data

Seed demo catalog products (idempotent: creates missing products and updates existing by name):

```bash
npm run seed:demo
```

## Implemented Frontend Pages

- Auth:
  - `/login`
  - `/register`
- User:
  - `/` (shop: catalog + cart + checkout)
  - `/product-search` (search products + price filters + add to cart)
  - `/orders` (user orders with live SSE updates)
- Admin:
  - `/orders` (all orders + live SSE updates)
  - `/search` (search orders by query/status with pagination)
  - `/products` (product CRUD)
  - `/analytics` (KPI dashboard + charts)

## Core Gateway Endpoints

- Auth:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `POST /auth/logout`
- Products:
  - `GET /products` (public)
  - `GET /products/:id` (public)
  - `POST /products` (admin)
  - `PATCH /products/:id` (admin)
  - `DELETE /products/:id` (admin)
- Orders:
  - `GET /orders` (auth)
  - `GET /orders/:id` (auth)
  - `POST /orders` (auth)
  - `GET /orders/stream` (auth SSE)
- Search:
  - `GET /search/products` (public)
  - `GET /search/orders` (auth)
- Analytics:
  - `GET /analytics/summary` (admin)

## Notes

- Auth uses short-lived access JWT + Redis-backed refresh token.
- Order lifecycle updates are event-driven and streamed to frontend via SSE.
- Search pages use Elasticsearch-backed endpoints.
- This repo uses one root `.env` for Docker Compose and host scripts.

## Deployment

- GitHub Actions workflow for EC2 self-hosted runner:
  - `.github/workflows/deploy-ec2-self-hosted.yml`
- Step-by-step EC2 + Docker + runner setup:
  - `docs/deployment-ec2.md`

