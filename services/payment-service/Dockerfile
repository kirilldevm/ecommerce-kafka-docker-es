FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/
COPY services/payment-service/package.json ./services/payment-service/

RUN npm ci

COPY tsconfig.base.json tsconfig.json ./
COPY shared ./shared
COPY services/payment-service ./services/payment-service

RUN npm run build -w @ecommerce/shared
RUN npm run build -w @ecommerce/payment-service

FROM node:20-alpine

RUN apk add --no-cache curl openssl

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/
COPY services/payment-service/package.json ./services/payment-service/

RUN npm ci --omit=dev

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/services/payment-service/dist ./services/payment-service/dist

WORKDIR /app/services/payment-service

EXPOSE 3002

CMD ["node", "dist/index.js"]
