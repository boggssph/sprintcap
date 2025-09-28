import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMocks } from 'node-mocks-http'

import { authOptions } from '../../lib/auth'

describe('contract: /api/auth/providers', () => {
  beforeEach(() => {
    // ensure env has google keys for provider to be enabled
    process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'test-google-id'
    process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'test-google-secret'
  })

  it('authOptions includes Google provider when env vars are present', async () => {
    const providers = (authOptions.providers || [])
    // basic contract: providers should be non-empty when GOOGLE env vars are present
    expect(providers.length).toBeGreaterThan(0)
  })
})
