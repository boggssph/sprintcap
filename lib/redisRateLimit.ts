import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL || ''
let client: Redis | null = null
if (redisUrl) {
  client = new Redis(redisUrl)
}

// Sliding window counter implementation using Redis sorted sets
export async function redisRateLimit(key: string, limit = 60, windowSeconds = 3600) {
  if (!client) return { allowed: true, remaining: limit }
  const now = Math.floor(Date.now() / 1000)
  const windowStart = now - windowSeconds
  const zkey = `rl:${key}`
  // Remove old entries
  await client.zremrangebyscore(zkey, 0, windowStart)
  // Count current
  const count = await client.zcard(zkey)
  if (count >= limit) {
    return { allowed: false, remaining: 0 }
  }
  // Add current timestamp
  await client.zadd(zkey, now, `${now}:${Math.random().toString(36).slice(2)}`)
  // Set TTL for the sorted set slightly above window
  await client.expire(zkey, windowSeconds + 60)
  return { allowed: true, remaining: limit - (count + 1) }
}
