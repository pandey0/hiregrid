import { Redis } from "@upstash/redis";

// Only initialize if environment variables are present to avoid crashes in non-configured environments
export const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

/**
 * Performance: Generic cache wrapper for expensive data lookups.
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300 // Default 5 mins
): Promise<T> {
  if (!redis) return fetcher();

  try {
    const cached = await redis.get(key);
    if (cached) {
      console.log(`[Cache] HIT: ${key}`);
      return cached as T;
    }
  } catch (err) {
    console.error(`[Cache] GET Error for ${key}:`, err);
  }

  const freshData = await fetcher();

  try {
    await redis.set(key, JSON.stringify(freshData), { ex: ttlSeconds });
    console.log(`[Cache] MISS (Saved): ${key}`);
  } catch (err) {
    console.error(`[Cache] SET Error for ${key}:`, err);
  }

  return freshData;
}

/**
 * Invalidation helper for when data changes.
 */
export async function invalidateCache(key: string | string[]) {
  if (!redis) return;
  try {
    const keys = Array.isArray(key) ? key : [key];
    await redis.del(...keys);
    console.log(`[Cache] INVALIDATED: ${keys.join(", ")}`);
  } catch (err) {
    console.error(`[Cache] DEL Error:`, err);
  }
}
