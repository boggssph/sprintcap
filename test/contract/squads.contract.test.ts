/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMocks } from 'node-mocks-http'
import type { NextApiRequest, NextApiResponse } from 'next'

// Mock next-auth to control authentication in the handler
vi.mock('next-auth', async () => ({ getServerSession: vi.fn() }))

// Mock prisma client used by the handler
vi.mock('../../lib/prisma', async () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    squad: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn(), findUniqueOrThrow: vi.fn() },
    squadMember: { count: vi.fn() }
  }
}))

import { getServerSession } from 'next-auth'
import { prisma } from '../../lib/prisma'

type MockedFn = (...args: any[]) => any

describe('squads API - Contract Test (GET/PATCH/DELETE)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should respond 401 when unauthenticated', async () => {
  vi.mocked(getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null)
  const { req, res } = createMocks({ method: 'PATCH' })

  const handler = await import('../../pages/api/squads/[id]')
  await handler.default(req as unknown as NextApiRequest, res as unknown as NextApiResponse)

    expect(res._getStatusCode()).toBe(401)
  })

  it('should update squad when authenticated as owner', async () => {
    vi.mocked(getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { email: 'owner@example.com' } })
    vi.mocked(prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'user-1', email: 'owner@example.com', role: 'SCRUM_MASTER' })
    vi.mocked(prisma.squad.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'squad-1', alias: 'S1', name: 'Squad One', scrumMasterId: 'user-1' })
    vi.mocked(prisma.squad.update as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'squad-1', alias: 'S1NEW', name: 'Squad One New' })
    vi.mocked(prisma.squadMember.count as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(5)

    const { req, res } = createMocks({ method: 'PATCH', query: { id: 'squad-1' }, body: { name: 'Squad One New', alias: 'S1NEW' } })
    const handler = await import('../../pages/api/squads/[id]')
    await handler.default(req as unknown as NextApiRequest, res as unknown as NextApiResponse)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data).toHaveProperty('id', 'squad-1')
    expect(data).toHaveProperty('alias', 'S1NEW')
    expect(data).toHaveProperty('memberCount', 5)
  })

  it('should respond 403 when authenticated but not owner', async () => {
    vi.mocked(getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { email: 'other@example.com' } })
    vi.mocked(prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'user-2', email: 'other@example.com', role: 'SCRUM_MASTER' })
    vi.mocked(prisma.squad.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'squad-1', alias: 'S1', name: 'Squad One', scrumMasterId: 'user-1' })

    const { req, res } = createMocks({ method: 'PATCH', query: { id: 'squad-1' }, body: { name: 'Hacked', alias: 'HACK' } })
    const handler = await import('../../pages/api/squads/[id]')
    await handler.default(req as unknown as NextApiRequest, res as unknown as NextApiResponse)

    expect(res._getStatusCode()).toBe(403)
  })

  it('should reject invalid alias format', async () => {
    vi.mocked(getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { email: 'owner@example.com' } })
    vi.mocked(prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'user-1', email: 'owner@example.com', role: 'SCRUM_MASTER' })
    vi.mocked(prisma.squad.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'squad-1', alias: 'S1', name: 'Squad One', scrumMasterId: 'user-1' })

    const { req, res } = createMocks({ method: 'PATCH', query: { id: 'squad-1' }, body: { alias: 'invalid alias!' } })
    const handler = await import('../../pages/api/squads/[id]')
    await handler.default(req as unknown as NextApiRequest, res as unknown as NextApiResponse)

    expect(res._getStatusCode()).toBe(400)
  })

  it('should reject alias uniqueness conflict', async () => {

  vi.mocked(getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { email: 'owner@example.com' } })
  vi.mocked(prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'user-1', email: 'owner@example.com', role: 'SCRUM_MASTER' })
  vi.mocked(prisma.squad.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'squad-1', alias: 'S1', name: 'Squad One', scrumMasterId: 'user-1' })
  // When checking alias uniqueness, pretend another squad exists with same alias
  vi.mocked(prisma.squad.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ id: 'squad-1', alias: 'S1', name: 'Squad One', scrumMasterId: 'user-1' })
  vi.mocked(prisma.squad.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ id: 'squad-2', alias: 'TAKEN', name: 'Taken Squad', scrumMasterId: 'user-9' })

  const { req, res } = createMocks({ method: 'PATCH', query: { id: 'squad-1' }, body: { alias: 'TAKEN' } })
  const handler = await import('../../pages/api/squads/[id]')
  await handler.default(req as unknown as NextApiRequest, res as unknown as NextApiResponse)

    expect(res._getStatusCode()).toBe(400)
  })

  it('should return squad details for GET', async () => {
  vi.mocked(getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { email: 'owner@example.com' } })
  vi.mocked(prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'user-1', email: 'owner@example.com' })
  vi.mocked(prisma.squad.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'squad-1', alias: 'S1', name: 'Squad One', scrumMasterId: 'user-1' })
  vi.mocked(prisma.squadMember.count as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(3)

  const { req, res } = createMocks({ method: 'GET', query: { id: 'squad-1' } })
  const handler = await import('../../pages/api/squads/[id]')
  await handler.default(req as unknown as NextApiRequest, res as unknown as NextApiResponse)

  expect(res._getStatusCode()).toBe(200)
  const data = JSON.parse(res._getData())
  expect(data).toHaveProperty('id', 'squad-1')
  expect(data).toHaveProperty('memberCount', 3)
  })

  it('should delete squad for owner', async () => {
  vi.mocked(getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { email: 'owner@example.com' } })
  vi.mocked(prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'user-1', email: 'owner@example.com' })
  vi.mocked(prisma.squad.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'squad-1', alias: 'S1', name: 'Squad One', scrumMasterId: 'user-1' })
  vi.mocked(prisma.squad.delete as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({})

  const { req, res } = createMocks({ method: 'DELETE', query: { id: 'squad-1' } })
  const handler = await import('../../pages/api/squads/[id]')
  await handler.default(req as unknown as NextApiRequest, res as unknown as NextApiResponse)

  expect(res._getStatusCode()).toBe(204)
  })
})
