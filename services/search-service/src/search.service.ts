import { getElasticsearchClient } from "./elasticsearch";
import { config } from "./config";

export interface SearchProductsParams {
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  limit: number;
}

export interface SearchOrdersParams {
  q?: string;
  status?: string;
  userId?: string;
  isAdmin: boolean;
  page: number;
  limit: number;
}

function parseHits<T>(hits: unknown): T[] {
  if (!hits || typeof hits !== "object" || !("hits" in hits)) {
    return [];
  }

  const inner = (hits as { hits: Array<{ _source?: T }> }).hits;
  return inner.map((hit) => hit._source).filter((doc): doc is T => doc !== undefined);
}

export async function searchProducts(params: SearchProductsParams) {
  const es = getElasticsearchClient();
  const from = (params.page - 1) * params.limit;

  const must: Record<string, unknown>[] = [{ term: { entityType: "product" } }];

  if (params.q) {
    must.push({
      multi_match: {
        query: params.q,
        fields: ["name^2", "description"],
        fuzziness: "AUTO",
      },
    });
  }

  const filter: Record<string, unknown>[] = [];

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    filter.push({
      range: {
        price: {
          ...(params.minPrice !== undefined ? { gte: params.minPrice } : {}),
          ...(params.maxPrice !== undefined ? { lte: params.maxPrice } : {}),
        },
      },
    });
  }

  const result = await es.search({
    index: config.elasticsearchIndex,
    from,
    size: params.limit,
    query: {
      bool: {
        must,
        ...(filter.length > 0 ? { filter } : {}),
      },
    },
    sort: [{ updatedAt: { order: "desc" } }],
  });

  const total =
    typeof result.hits.total === "number"
      ? result.hits.total
      : (result.hits.total?.value ?? 0);

  return {
    items: parseHits<Record<string, unknown>>(result.hits),
    total,
    page: params.page,
    limit: params.limit,
  };
}

export async function searchOrders(params: SearchOrdersParams) {
  const es = getElasticsearchClient();
  const from = (params.page - 1) * params.limit;

  const must: Record<string, unknown>[] = [{ term: { entityType: "order" } }];

  if (params.q) {
    must.push({
      multi_match: {
        query: params.q,
        fields: ["orderId", "productNames", "status"],
        fuzziness: "AUTO",
      },
    });
  }

  const filter: Record<string, unknown>[] = [];

  if (params.status) {
    filter.push({ term: { status: params.status } });
  }

  if (!params.isAdmin && params.userId) {
    filter.push({ term: { userId: params.userId } });
  }

  const result = await es.search({
    index: config.elasticsearchIndex,
    from,
    size: params.limit,
    query: {
      bool: {
        must,
        ...(filter.length > 0 ? { filter } : {}),
      },
    },
    sort: [{ updatedAt: { order: "desc" } }],
  });

  const total =
    typeof result.hits.total === "number"
      ? result.hits.total
      : (result.hits.total?.value ?? 0);

  return {
    items: parseHits<Record<string, unknown>>(result.hits),
    total,
    page: params.page,
    limit: params.limit,
  };
}
