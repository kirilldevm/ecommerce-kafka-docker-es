function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseCorsOrigins(value: string | undefined): string[] {
  const raw = value ?? "http://localhost:5173";
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const config = {
  port: Number(process.env.PORT ?? 8000),
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS),
  jwtSecret: requireEnv("JWT_SECRET"),
  authServiceUrl: requireEnv("AUTH_SERVICE_URL"),
  productServiceUrl: requireEnv("PRODUCT_SERVICE_URL"),
  orderServiceUrl: requireEnv("ORDER_SERVICE_URL"),
  searchServiceUrl: requireEnv("SEARCH_SERVICE_URL"),
  analyticsServiceUrl: requireEnv("ANALYTICS_SERVICE_URL"),
} as const;
