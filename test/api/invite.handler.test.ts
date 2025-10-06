import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock getServerSession
vi.mock('next-auth', async () => {
  return {
    getServerSession: vi.fn()
  }
})

// Mock inviteService
vi.mock('../../lib/inviteService', async () => {
  return {
    listInvites: vi.fn(),
    createInvite: vi.fn(),
    regenerateInvite: vi.fn(),
    revokeInvite: vi.fn()
  }
})

import { createMocks } from 'node-mocks-http'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import * as inviteService from '../../lib/inviteService'
import handler from '../../pages/api/invite'

describe('api/invite handler', () => {
  beforeEach(() => {
    vi.mocked(getServerSession).mockReset()
    vi.mocked(inviteService.listInvites).mockReset()
    vi.mocked(inviteService.createInvite).mockReset()
    vi.mocked(inviteService.regenerateInvite).mockReset()
    vi.mocked(inviteService.revokeInvite).mockReset()
  })

  it('returns 401 when unauthenticated on GET', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const { req, res } = createMocks({ method: 'GET' })
    await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse)
    expect(res._getStatusCode()).toBe(401)
  })

  it('delegates to listInvites on GET', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: 'admin@example.com' } })
    vi.mocked(inviteService.listInvites).mockResolvedValue({ invites: [], nextCursor: null })
    const { req, res } = createMocks({ method: 'GET', query: {} })
    await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse)
    expect(res._getStatusCode()).toBe(200)
  })
})
