FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/
COPY services/search-service/package.json ./services/search-service/

RUN npm ci

COPY tsconfig.base.json tsconfig.json ./
COPY shared ./shared
COPY services/search-service ./services/search-service

RUN npm run build -w @ecommerce/shared
RUN npm run build -w @ecommerce/search-service

FROM node:20-alpine

RUN apk add --no-cache curl openssl

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/
COPY services/search-service/package.json ./services/search-service/

RUN npm ci --omit=dev

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/services/search-service/dist ./services/search-service/dist

WORKDIR /app/services/search-service

EXPOSE 3005

CMD ["node", "dist/index.js"]
