import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

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
