import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createMocks } from 'node-mocks-http'
import { getServerSession } from 'next-auth'
import type { NextApiRequest, NextApiResponse } from 'next'

// Mock next-auth
vi.mock('next-auth', async () => {
  return {
    getServerSession: vi.fn()
  }
})

// Mock Prisma client
vi.mock('../../lib/prisma', async () => {
  return {
    prisma: {
      user: {
        findUnique: vi.fn()
      },
      sprint: {
        create: vi.fn(),
        findFirst: vi.fn()
      },
      squadMember: {
        findMany: vi.fn()
      },
      squad: {
        findUnique: vi.fn()
      },
      sprintMember: {
        createMany: vi.fn()
      },
      $transaction: vi.fn()
    }
  }
})

import { prisma } from '../../lib/prisma'

describe('Sprint Creation - Authorization Integration', () => {
  beforeEach(() => {
    vi.mocked(getServerSession as unknown as ReturnType<typeof vi.fn>).mockReset()
    vi.mocked(prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockReset()
    vi.mocked(prisma.squad.findUnique as unknown as ReturnType<typeof vi.fn>).mockReset()
    vi.mocked(prisma.sprint.create as unknown as ReturnType<typeof vi.fn>).mockReset()
    vi.mocked(prisma.sprint.findFirst as unknown as ReturnType<typeof vi.fn>).mockReset()
    vi.mocked(prisma.squadMember.findMany as unknown as ReturnType<typeof vi.fn>).mockReset()
    vi.mocked(prisma.sprintMember.createMany as unknown as ReturnType<typeof vi.fn>).mockReset()
    vi.mocked(prisma.$transaction as unknown as ReturnType<typeof vi.fn>).mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should allow Scrum Master to create sprint for owned squad', async () => {
    // Mock authenticated Scrum Master
    vi.mocked(getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'scrum.master@example.com',
        role: 'SCRUM_MASTER'
      }
    })

    // Mock user lookup
    vi.mocked(prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'user-1',
      email: 'scrum.master@example.com',
      role: 'SCRUM_MASTER'
    })

    // Mock squad ownership
    vi.mocked(prisma.squad.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'owned-squad',
      name: 'Owned Squad',
      scrumMasterId: 'user-1' // User owns this squad
    })

    const requestBody = {
      name: 'Authorized Sprint',
      squadId: 'owned-squad',
      startDate: '2025-10-01T09:00:00Z',
      endDate: '2025-10-15T17:00:00Z'
    }

    // Mock no overlapping sprints
  vi.mocked(prisma.sprint.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    // Mock squad members for population
    vi.mocked(prisma.squadMember.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      { userId: 'member-1' }
    ])

    // Mock transaction for successful creation
    vi.mocked(prisma.$transaction as unknown as ReturnType<typeof vi.fn>).mockImplementation(async (callback) => {
      const result = await callback(prisma)
      return {
        sprint: result.sprint,
        memberCount: 1,
        squadName: 'Owned Squad'
      }
    })

    // Mock sprint creation
    vi.mocked(prisma.sprint.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'authorized-sprint',
      name: 'Authorized Sprint',
      squadId: 'owned-squad',
      startDate: new Date('2025-10-01T09:00:00Z'),
      endDate: new Date('2025-10-15T17:00:00Z'),
      createdAt: new Date('2025-09-26T10:00:00Z')
    })

    const { req, res } = createMocks({
      method: 'POST',
      body: requestBody,
      headers: {
        'content-type': 'application/json'
      }
    })

  const handler = await import('../../pages/api/sprints')
  await handler.default(req as unknown as NextApiRequest, res as unknown as NextApiResponse)

    expect(res._getStatusCode()).toBe(201)

    // Verify ownership check was performed
    expect(prisma.squad.findUnique).toHaveBeenCalledWith({
      where: { id: 'owned-squad' }
    })
  })

  it('should deny regular member from creating sprint', async () => {
    // Mock authenticated regular member
    vi.mocked(getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: {
        id: 'user-2',
        email: 'regular.member@example.com',
        role: 'MEMBER'
      }
    })

    // Mock user lookup
    vi.mocked(prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'user-2',
      email: 'regular.member@example.com',
      role: 'MEMBER'
    })

    // Mock squad exists but user doesn't own it
    vi.mocked(prisma.squad.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'some-squad',
      name: 'Some Squad',
      scrumMasterId: 'different-user'
    })

    const requestBody = {
      name: 'Unauthorized Sprint',
      squadId: 'some-squad',
      startDate: '2025-10-01T09:00:00Z',
      endDate: '2025-10-15T17:00:00Z'
    }

    const { req, res } = createMocks({
      method: 'POST',
      body: requestBody,
      headers: {
        'content-type': 'application/json'
      }
    })

  const handler = await import('../../pages/api/sprints')
  await handler.default(req as unknown as NextApiRequest, res as unknown as NextApiResponse)

    expect(res._getStatusCode()).toBe(403)
    const responseData = JSON.parse(res._getData())
    expect(responseData.error).toContain('Only Scrum Masters can create sprints')
  })

  it('should deny Scrum Master from creating sprint for unowned squad', async () => {
    // Mock authenticated Scrum Master
    vi.mocked(getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'scrum.master@example.com',
        role: 'SCRUM_MASTER'
      }
    })

    // Mock user lookup
    vi.mocked(prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'user-1',
      email: 'scrum.master@example.com',
      role: 'SCRUM_MASTER'
    })

    // Mock squad ownership by different Scrum Master
    vi.mocked(prisma.squad.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'unowned-squad',
      name: 'Unowned Squad',
      scrumMasterId: 'different-user' // Different owner
    })

    const requestBody = {
      name: 'Unauthorized Sprint',
      squadId: 'unowned-squad',
      startDate: '2025-10-01T09:00:00Z',
      endDate: '2025-10-15T17:00:00Z'
    }

    const { req, res } = createMocks({
      method: 'POST',
      body: requestBody,
      headers: {
        'content-type': 'application/json'
      }
    })

  const handler = await import('../../pages/api/sprints')
  await handler.default(req as unknown as NextApiRequest, res as unknown as NextApiResponse)

    expect(res._getStatusCode()).toBe(403)
    const responseData = JSON.parse(res._getData())
    expect(responseData.error).toContain('Access denied')

    // Verify ownership check was performed
    expect(prisma.squad.findUnique).toHaveBeenCalledWith({
      where: { id: 'unowned-squad' }
    })
  })

  it('should deny unauthenticated users', async () => {
    // Mock unauthenticated user
  vi.mocked(getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    const requestBody = {
      name: 'Unauthenticated Sprint',
      squadId: 'some-squad',
      startDate: '2025-10-01T09:00:00Z',
      endDate: '2025-10-15T17:00:00Z'
    }

    const { req, res } = createMocks({
      method: 'POST',
      body: requestBody,
      headers: {
        'content-type': 'application/json'
      }
    })

  const handler = await import('../../pages/api/sprints')
  await handler.default(req as unknown as NextApiRequest, res as unknown as NextApiResponse)

    expect(res._getStatusCode()).toBe(401)
    const responseData = JSON.parse(res._getData())
    expect(responseData.error).toContain('unauthenticated')
  })

  it('should deny access to non-existent squad', async () => {
    // Mock authenticated Scrum Master
    vi.mocked(getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'scrum.master@example.com',
        role: 'SCRUM_MASTER'
      }
    })

    // Mock user lookup
    vi.mocked(prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'user-1',
      email: 'scrum.master@example.com',
      role: 'SCRUM_MASTER'
    })

    // Mock squad not found
  vi.mocked(prisma.squad.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    const requestBody = {
      name: 'Non-existent Squad Sprint',
      squadId: 'non-existent-squad',
      startDate: '2025-10-01T09:00:00Z',
      endDate: '2025-10-15T17:00:00Z'
    }

    const { req, res } = createMocks({
      method: 'POST',
      body: requestBody,
      headers: {
        'content-type': 'application/json'
      }
    })

  const handler = await import('../../pages/api/sprints')
  await handler.default(req as unknown as NextApiRequest, res as unknown as NextApiResponse)

    expect(res._getStatusCode()).toBe(404)
    const responseData = JSON.parse(res._getData())
    expect(responseData.error).toContain('not found')
  })

  it('should deny creation of sprint with duplicate name in same squad', async () => {
    // Mock authenticated Scrum Master
    vi.mocked(getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'scrum.master@example.com',
        role: 'SCRUM_MASTER'
      }
    })

    // Mock user lookup
    vi.mocked(prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'user-1',
      email: 'scrum.master@example.com',
      role: 'SCRUM_MASTER'
    })

    // Mock squad ownership
    vi.mocked(prisma.squad.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'owned-squad',
      name: 'Owned Squad',
      scrumMasterId: 'user-1' // User owns this squad
    })

    const requestBody = {
      name: 'FMBS-Sprint-111',
      squadId: 'owned-squad',
      startDate: '2025-10-01T09:00:00Z',
      endDate: '2025-10-15T17:00:00Z'
    }

    // Mock existing sprint with same name in the squad (first call for uniqueness check)
    // and no overlapping sprints (second call for date overlap check)
    vi.mocked(prisma.sprint.findFirst as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        id: 'existing-sprint',
        name: 'FMBS-Sprint-111',
        squadId: 'owned-squad'
      })
      .mockResolvedValueOnce(null)

    const { req, res } = createMocks({
      method: 'POST',
      body: requestBody,
      headers: {
        'content-type': 'application/json'
      }
    })

  const handler = await import('../../pages/api/sprints')
  await handler.default(req as unknown as NextApiRequest, res as unknown as NextApiResponse)

    expect(res._getStatusCode()).toBe(409)
    const responseData = JSON.parse(res._getData())
    expect(responseData.error).toContain("A sprint with the name 'FMBS-Sprint-111' already exists in this squad")
  })
})