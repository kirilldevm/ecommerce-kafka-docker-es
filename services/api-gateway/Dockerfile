FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/
COPY services/api-gateway/package.json ./services/api-gateway/

RUN npm ci

COPY tsconfig.base.json tsconfig.json ./
COPY services/api-gateway ./services/api-gateway

RUN npm run build -w @ecommerce/api-gateway

FROM node:20-alpine

RUN apk add --no-cache curl

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/
COPY services/api-gateway/package.json ./services/api-gateway/

RUN npm ci --omit=dev

COPY --from=builder /app/services/api-gateway/dist ./services/api-gateway/dist

WORKDIR /app/services/api-gateway

EXPOSE 8000

CMD ["node", "dist/index.js"]
