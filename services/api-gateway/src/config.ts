function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 8000),
  jwtSecret: requireEnv("JWT_SECRET"),
  authServiceUrl: requireEnv("AUTH_SERVICE_URL"),
  productServiceUrl: requireEnv("PRODUCT_SERVICE_URL"),
} as const;
