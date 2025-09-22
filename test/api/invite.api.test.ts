import { describe, it, expect, beforeEach, vi } from 'vitest'
import { hashToken } from '../../lib/tokenUtils'
import crypto from 'crypto'

// Basic unit tests for token utils

describe('tokenUtils', () => {
  it('hashToken matches manual crypto', () => {
    const t = 'abc123'
    const expected = crypto.createHash('sha256').update(t).digest('hex')
    expect(hashToken(t)).toBe(expected)
  })
})
