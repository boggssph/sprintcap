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
import { getServerSession } from 'next-auth'
import * as inviteService from '../../lib/inviteService'
import handler from '../../pages/api/invite'

describe('api/invite handler', () => {
  beforeEach(() => {
    ;(getServerSession as any).mockReset()
    ;(inviteService.listInvites as any).mockReset()
    ;(inviteService.createInvite as any).mockReset()
    ;(inviteService.regenerateInvite as any).mockReset()
    ;(inviteService.revokeInvite as any).mockReset()
  })

  it('returns 401 when unauthenticated on GET', async () => {
    ;(getServerSession as any).mockResolvedValue(null)
    const { req, res } = createMocks({ method: 'GET' })
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(401)
  })

  it('delegates to listInvites on GET', async () => {
    ;(getServerSession as any).mockResolvedValue({ user: { email: 'admin@example.com' } })
    ;(inviteService.listInvites as any).mockResolvedValue({ invites: [], nextCursor: null })
    const { req, res } = createMocks({ method: 'GET', query: {} })
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(200)
  })
})
