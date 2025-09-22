import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../lib/prisma', async () => {
  const actual = await vi.importActual('../../lib/prisma')
  return {
    prisma: {
      user: { findUnique: vi.fn() },
      invitation: { findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
      auditLog: { create: vi.fn() }
    }
  }
})

import { listInvites, createInvite, regenerateInvite, revokeInvite } from '../../lib/inviteService'
import { prisma } from '../../lib/prisma'

describe('inviteService', () => {
  beforeEach(() => {
    ;(prisma.user.findUnique as any).mockReset()
    ;(prisma.invitation.findMany as any).mockReset()
    ;(prisma.invitation.create as any).mockReset()
    ;(prisma.invitation.update as any).mockReset()
    ;(prisma.auditLog.create as any).mockReset()
  })

  it('listInvites throws if actor missing', async () => {
    ;(prisma.user.findUnique as any).mockResolvedValue(null)
    await expect(listInvites('noone@example.com', {})).rejects.toThrow('forbidden')
  })

  it('createInvite returns token and id', async () => {
    ;(prisma.user.findUnique as any).mockResolvedValue({ id: 'actor-1', role: 'ADMIN' })
    ;(prisma.invitation.create as any).mockResolvedValue({ id: 'inv-1' })
    const r = await createInvite('admin@example.com', { email: 'new@x.com', role: 'MEMBER' })
    expect(r).toHaveProperty('id', 'inv-1')
    expect(r).toHaveProperty('token')
  })

  it('regenerateInvite requires admin', async () => {
    ;(prisma.user.findUnique as any).mockResolvedValue({ id: 'user-1', role: 'MEMBER' })
    await expect(regenerateInvite('user@example.com', 'inv-1')).rejects.toThrow('only ADMIN')
  })

  it('revokeInvite requires admin', async () => {
    ;(prisma.user.findUnique as any).mockResolvedValue({ id: 'user-1', role: 'MEMBER' })
    await expect(revokeInvite('user@example.com', 'inv-1')).rejects.toThrow('only ADMIN')
  })
})
