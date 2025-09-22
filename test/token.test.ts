import { describe, it, expect } from 'vitest'
import crypto from 'crypto'

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

describe('token hashing', () => {
  it('hashes consistently', () => {
    const t = 'my-secret-token'
    const h1 = hashToken(t)
    const h2 = hashToken(t)
    expect(h1).toBe(h2)
  })

  it('different tokens produce different hashes', () => {
    const h1 = hashToken('a')
    const h2 = hashToken('b')
    expect(h1).not.toBe(h2)
  })
})
