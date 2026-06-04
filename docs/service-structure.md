# Service structure

HTTP and Kafka services follow the same layered layout. Validation lives in **DTOs** using [Zod](https://zod.dev/) (via `@ecommerce/shared`).

## Folder layout

```
src/
  index.ts              # bootstrap, graceful shutdown
  app.ts                # Express app (HTTP services only)
  config.ts
  controllers/          # HTTP: parse input, call services, send response
  routes/               # wire paths → controllers + middleware
  dto/                  # Zod schemas + parse helpers
  services/             # business logic, DB, domain rules
  producers/            # Kafka event publishing
  consumers/            # Kafka event handling
  middleware/           # auth, user context, error handler
  errors/               # service-specific HttpError subclasses (optional)
```

Kafka-only services (`payment-service`, `delivery-service`) omit `app` routes except `/health` in `index.ts`; they use `consumers/`, `services/`, and `producers/`.

## Shared HTTP utilities (`@ecommerce/shared`)

| Export | Purpose |
|--------|---------|
| `HttpError` | Base error with `statusCode` |
| `asyncHandler` | Wrap async Express handlers |
| `createErrorHandler()` | Maps `HttpError` → JSON response |
| `parseBody` / `parseQuery` | Run Zod schemas on request data |
| `z` | Re-exported Zod |
| `paginationQuerySchema` | Common `page` / `limit` query params |

### Example DTO

```ts
import { parseBody, z } from "@ecommerce/shared";
import { ProductError } from "../errors/product.error";

export const createProductSchema = z.object({
  name: z.string().trim().min(1),
  price: z.coerce.number().nonnegative(),
});

export function parseCreateProductBody(body: unknown) {
  return parseBody(createProductSchema, body, ProductError);
}
```

### Example controller

```ts
export const create = asyncHandler(async (req, res) => {
  const input = parseCreateProductBody(req.body);
  const product = await createProduct(input);
  res.status(201).json({ product });
});
```

## Service map

| Service | HTTP | Kafka consumer | Kafka producer |
|---------|------|----------------|----------------|
| `api-gateway` | proxy routes | — | — |
| `auth-service` | register/login/refresh | — | — |
| `product-service` | CRUD | — | product events |
| `order-service` | orders + SSE | payments, delivery | order created |
| `search-service` | search APIs | index sync | — |
| `analytics-service` | summary | orders, payments, delivery | — |
| `payment-service` | health | orders created | payment processed |
| `delivery-service` | health | payment processed | status updates |

## Guidelines

1. **Controllers** stay thin: validate (DTO) → call service → set status/json.
2. **Services** do not read `req`/`res`; they throw `*Error extends HttpError`.
3. **Producers** only publish; no business rules beyond event shape.
4. **Consumers** parse events, delegate to services, keep idempotency in services when needed.
5. Prefer **Zod** over hand-written `typeof` checks for all new endpoints.
