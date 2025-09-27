import { redisRateLimit } from './redisRateLimit'

type Key = string

const buckets = new Map<Key, { tokens: number; last: number }>()

export async function rateLimit(key: string, limit = 60, windowSeconds = 3600) {
  // If Redis configured, use it (distributed)
  if (process.env.REDIS_URL) {
    try {
      return await redisRateLimit(key, limit, windowSeconds)
    } catch (e) {
      console.warn('Redis rate limit failed, falling back to in-memory', e)
    }
  }

  const now = Date.now()
  const bucket = buckets.get(key) || { tokens: limit, last: now }
  const elapsed = (now - bucket.last) / 1000
  // Refill
  const refill = (elapsed / windowSeconds) * limit
  bucket.tokens = Math.min(limit, bucket.tokens + refill)
  bucket.last = now

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1
    buckets.set(key, bucket)
    return { allowed: true, remaining: Math.floor(bucket.tokens) }
  }

  buckets.set(key, bucket)
  return { allowed: false, remaining: 0 }
}
