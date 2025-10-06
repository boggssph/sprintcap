import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../lib/prisma', async () => {
  await vi.importActual('../../lib/prisma')
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
    vi.mocked(prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockReset()
    vi.mocked(prisma.invitation.findMany as unknown as ReturnType<typeof vi.fn>).mockReset()
    vi.mocked(prisma.invitation.create as unknown as ReturnType<typeof vi.fn>).mockReset()
    vi.mocked(prisma.invitation.update as unknown as ReturnType<typeof vi.fn>).mockReset()
    vi.mocked(prisma.auditLog.create as unknown as ReturnType<typeof vi.fn>).mockReset()
  })

  it('listInvites throws if actor missing', async () => {
  vi.mocked(prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    await expect(listInvites('noone@example.com', {})).rejects.toThrow('forbidden')
  })

  it('createInvite returns token and id', async () => {
  vi.mocked(prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'actor-1', role: 'ADMIN' })
  vi.mocked(prisma.invitation.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'inv-1' })
    const r = await createInvite('admin@example.com', { email: 'new@x.com', role: 'MEMBER' })
    expect(r).toHaveProperty('id', 'inv-1')
    expect(r).toHaveProperty('token')
  })

  it('regenerateInvite requires admin', async () => {
  vi.mocked(prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'user-1', role: 'MEMBER' })
    await expect(regenerateInvite('user@example.com', 'inv-1')).rejects.toThrow('only ADMIN')
  })

  it('revokeInvite requires admin', async () => {
  vi.mocked(prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'user-1', role: 'MEMBER' })
    await expect(revokeInvite('user@example.com', 'inv-1')).rejects.toThrow('only ADMIN')
  })
})
