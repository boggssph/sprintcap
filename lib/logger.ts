import crypto from 'crypto'

export function hashPII(value?: string) {
  if (!value) return null
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 16)
}

export function authLog(event: string, info: Record<string, any> = {}) {
  const out = {
    ts: new Date().toISOString(),
    event,
    ...info,
  }
  // keep logs structured but avoid printing raw PII
  console.info('[auth]', JSON.stringify(out))
}

export default {
  hashPII,
  authLog,
}
