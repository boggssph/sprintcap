import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMocks } from 'node-mocks-http'

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

import { getServerSession } from 'next-auth'
import * as inviteService from '../../lib/inviteService'
import handler from '../../pages/api/invite'

describe('contract: /api/invite', () => {
  beforeEach(() => {
    ;(getServerSession as any).mockReset()
    ;(inviteService.listInvites as any).mockReset()
    ;(inviteService.createInvite as any).mockReset()
  })

  it('GET should return 401 when unauthenticated', async () => {
    ;(getServerSession as any).mockResolvedValue(null)
    const { req, res } = createMocks({ method: 'GET' })
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(401)
  })

  it('POST create should return 201 for authorized user', async () => {
    ;(getServerSession as any).mockResolvedValue({ user: { email: 'admin@example.com' } })
    ;(inviteService.createInvite as any).mockResolvedValue({ id: 'inv-1', email: 'foo@bar.com' })
    const { req, res } = createMocks({ method: 'POST', body: { email: 'foo@bar.com' } })
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(201)
  })
})
