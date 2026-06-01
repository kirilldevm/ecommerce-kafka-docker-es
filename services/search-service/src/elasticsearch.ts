import { Client } from "@elastic/elasticsearch";
import { config } from "./config";

let client: Client | null = null;

export function getElasticsearchClient(): Client {
  if (!client) {
    client = new Client({ node: config.elasticsearchNode });
  }
  return client;
}

const INDEX_MAPPINGS = {
  properties: {
    entityType: { type: "keyword" },
    orderId: { type: "keyword" },
    userId: { type: "keyword" },
    status: { type: "keyword" },
    total: { type: "float" },
    productNames: { type: "text" },
    productIds: { type: "keyword" },
    createdAt: { type: "date" },
    updatedAt: { type: "date" },
    productId: { type: "keyword" },
    name: { type: "text" },
    description: { type: "text" },
    price: { type: "float" },
    stock: { type: "integer" },
  },
} as const;

export async function ensureSearchIndex(): Promise<void> {
  const es = getElasticsearchClient();
  const exists = await es.indices.exists({ index: config.elasticsearchIndex });

  if (!exists) {
    await es.indices.create({
      index: config.elasticsearchIndex,
      mappings: INDEX_MAPPINGS,
    });
    console.log(`Created Elasticsearch index: ${config.elasticsearchIndex}`);
  }
}

export function productDocId(productId: string): string {
  return `product:${productId}`;
}

export function orderDocId(orderId: string): string {
  return `order:${orderId}`;
}

export async function upsertDocument(
  id: string,
  document: Record<string, unknown>,
): Promise<void> {
  const es = getElasticsearchClient();
  await es.index({
    index: config.elasticsearchIndex,
    id,
    document,
    refresh: true,
  });
}

export async function deleteDocument(id: string): Promise<void> {
  const es = getElasticsearchClient();
  try {
    await es.delete({
      index: config.elasticsearchIndex,
      id,
      refresh: true,
    });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "meta" in err &&
      (err as { meta?: { statusCode?: number } }).meta?.statusCode === 404
    ) {
      return;
    }
    throw err;
  }
}
