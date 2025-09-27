import { describe, it, expect } from 'vitest'
import { generateToken, hashToken } from '../../lib/tokenUtils'

describe('tokenUtils', () => {
  it('generateToken returns hex string of expected length', () => {
    const t = generateToken(16)
    expect(typeof t).toBe('string')
    expect(t.length).toBe(32)
  })

  it('hashToken produces consistent sha256 hex', () => {
    const t = 'fixed-token'
    const h1 = hashToken(t)
    const h2 = hashToken(t)
    expect(h1).toBe(h2)
    expect(h1.length).toBe(64)
  })
})
