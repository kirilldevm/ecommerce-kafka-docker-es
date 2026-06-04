import { paginationQuerySchema, parseQuery, z } from "@ecommerce/shared";

export const searchProductsQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
});

export const searchOrdersQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().optional(),
  status: z.string().trim().optional(),
});

export type SearchProductsQuery = z.output<typeof searchProductsQuerySchema>;
export type SearchOrdersQuery = z.output<typeof searchOrdersQuerySchema>;

export function parseSearchProductsQuery(
  query: unknown,
): SearchProductsQuery {
  return parseQuery(searchProductsQuerySchema, query);
}

export function parseSearchOrdersQuery(query: unknown): SearchOrdersQuery {
  return parseQuery(searchOrdersQuerySchema, query);
}
