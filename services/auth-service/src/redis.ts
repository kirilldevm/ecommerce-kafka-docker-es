import Redis from "ioredis";
import { config } from "./config";

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(config.redisUrl);
  }
  return redis;
}

export async function connectRedis(): Promise<void> {
  await getRedis().ping();
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

const REFRESH_PREFIX = "refresh:";

export async function storeRefreshToken(
  token: string,
  userId: string,
  ttlSeconds: number,
): Promise<void> {
  await getRedis().set(`${REFRESH_PREFIX}${token}`, userId, "EX", ttlSeconds);
}

export async function getRefreshTokenUserId(
  token: string,
): Promise<string | null> {
  return getRedis().get(`${REFRESH_PREFIX}${token}`);
}

export async function deleteRefreshToken(token: string): Promise<void> {
  await getRedis().del(`${REFRESH_PREFIX}${token}`);
}
