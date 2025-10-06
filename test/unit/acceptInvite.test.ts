import { describe, it, expect, vi, beforeEach } from 'vitest'
import { acceptInvite } from '../../lib/inviteService'
import { prisma } from '../../lib/prisma'

vi.mock('../../lib/prisma', async () => {
  return {
    prisma: {
      invitation: { findFirst: vi.fn(), update: vi.fn(), create: vi.fn() },
      user: { findUnique: vi.fn(), create: vi.fn() },
      squadMember: { create: vi.fn() },
      auditLog: { create: vi.fn() }
    }
  }
})

describe('acceptInvite', () => {
  beforeEach(() => { vi.clearAllMocks(); return undefined })

  it('accepts a valid token and creates/links user', async () => {
    const mockInvite = { id: 'inv1', email: 'new@user.com', squadId: null }
  vi.mocked(prisma.invitation.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockInvite)
  vi.mocked(prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null)
  vi.mocked(prisma.user.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'user1', email: 'new@user.com' })

    const res = await acceptInvite('token123', 'new@user.com')
    expect(res.success).toBe(true)
  })
})
