import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Gracefully degrade: if Upstash env vars are not set, skip rate limiting.
// Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.local to enable.
function createRatelimiter(requests: number, windowSeconds: number) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const redis = new Redis({ url, token });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
    analytics: false,
  });
}

// /api/analyze: max 5 requests per 60 seconds per IP
export const analyzeRatelimit = createRatelimiter(5, 60);

// /api/remediate: max 10 requests per 60 seconds per IP (streaming, cheaper per call)
export const remediateRatelimit = createRatelimiter(10, 60);

export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
): Promise<{ limited: boolean; remaining?: number; reset?: number }> {
  if (!limiter) return { limited: false };

  const { success, remaining, reset } = await limiter.limit(identifier);
  return { limited: !success, remaining, reset };
}
