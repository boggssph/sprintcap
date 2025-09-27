import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as inviteService from '../../lib/inviteService'
import { prisma } from '../../lib/prisma'

vi.mock('../../lib/prisma', async () => {
  return {
    prisma: {
      user: { findUnique: vi.fn(), count: vi.fn(), create: vi.fn(), update: vi.fn() },
      invitation: { create: vi.fn(), update: vi.fn(), findMany: vi.fn(), findFirst: vi.fn() },
      auditLog: { create: vi.fn() }
    }
  }
})

describe('inviteService basic flows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createInvite throws when actor not found', async () => {
    ;(prisma.user.findUnique as any).mockResolvedValue(null)
    await expect(inviteService.createInvite('noone@example.com', { email: 'a@b.com' })).rejects.toThrow()
  })
})
