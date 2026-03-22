import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Only initialize if environment variables are present to avoid crashes in non-configured environments
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

export const publicLinkRatelimit = redis 
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      analytics: true,
      prefix: "@upstash/ratelimit/hiregrid/public",
    })
  : null;

export const authRatelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      analytics: true,
      prefix: "@upstash/ratelimit/hiregrid/auth",
    })
  : null;
