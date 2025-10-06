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

describe('Sprint Creation - Empty Squad Integration', () => {
  beforeEach(() => {
  vi.mocked(getServerSession as unknown as ReturnType<typeof vi.fn>).mockReset()
  vi.mocked(prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockReset()
  vi.mocked(prisma.sprint.create as unknown as ReturnType<typeof vi.fn>).mockReset()
  vi.mocked(prisma.squadMember.findMany as unknown as ReturnType<typeof vi.fn>).mockReset()
  vi.mocked(prisma.squad.findUnique as unknown as ReturnType<typeof vi.fn>).mockReset()
  vi.mocked(prisma.sprintMember.createMany as unknown as ReturnType<typeof vi.fn>).mockReset()
  vi.mocked(prisma.$transaction as unknown as ReturnType<typeof vi.fn>).mockReset()

    // Mock user lookup to return a valid Scrum Master
    vi.mocked(prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'user-1',
      email: 'scrum.master@example.com',
      role: 'SCRUM_MASTER'
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should create sprint successfully for squad with no active members', async () => {
    // Mock authenticated Scrum Master
    vi.mocked(getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'scrum.master@example.com',
        role: 'SCRUM_MASTER'
      }
    })

    // Mock squad ownership
    vi.mocked(prisma.squad.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'empty-squad',
      name: 'Empty Squad',
      scrumMasterId: 'user-1'
    })

    // Mock empty squad members list
  vi.mocked(prisma.squadMember.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([])

    // Mock sprint creation
    vi.mocked(prisma.sprint.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'empty-sprint',
      name: 'Sprint for Empty Squad',
      squadId: 'empty-squad',
      startDate: new Date('2025-10-01T09:00:00Z'),
      endDate: new Date('2025-10-15T17:00:00Z'),
      createdAt: new Date('2025-09-26T10:00:00Z')
    })

    const requestBody = {
      name: 'Sprint for Empty Squad',
      squadId: 'empty-squad',
      startDate: '2025-10-01T09:00:00Z',
      endDate: '2025-10-15T17:00:00Z'
    }

    // Mock no overlapping sprints
  vi.mocked(prisma.sprint.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    // Mock transaction for successful creation
    vi.mocked(prisma.$transaction as unknown as ReturnType<typeof vi.fn>).mockImplementation(async (callback) => {
      const result = await callback(prisma)
      return {
        sprint: result.sprint,
        memberCount: 0,
        squadName: 'Empty Squad'
      }
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
    const responseData = JSON.parse(res._getData())

    expect(responseData).toHaveProperty('id', 'empty-sprint')
    expect(responseData).toHaveProperty('name', 'Sprint for Empty Squad')
    expect(responseData).toHaveProperty('memberCount', 0)

    // Verify squad members query was made
    expect(prisma.squadMember.findMany).toHaveBeenCalledWith({
      where: { squadId: 'empty-squad' },
      include: { user: { select: { displayName: true, email: true } } }
    })

    // Verify transaction was called
    expect(prisma.$transaction).toHaveBeenCalled()

    // Verify sprint was created
    expect(prisma.sprint.create).toHaveBeenCalledWith({
      data: {
        name: 'Sprint for Empty Squad',
        squadId: 'empty-squad',
        startDate: new Date('2025-10-01T09:00:00Z'),
        endDate: new Date('2025-10-15T17:00:00Z'),
        status: 'INACTIVE'
      }
    })

    // Verify no sprint members were created (empty array)
    expect(prisma.sprintMember.createMany).not.toHaveBeenCalled()
  })

  it('should handle squad with only inactive members', async () => {
    // Mock authenticated Scrum Master
    vi.mocked(getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'scrum.master@example.com',
        role: 'SCRUM_MASTER'
      }
    })

    // Mock squad ownership
    vi.mocked(prisma.squad.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'inactive-squad',
      name: 'Squad with Inactive Members',
      scrumMasterId: 'user-1'
    })

    // Mock squad members query returns empty (simulating inactive members)
  vi.mocked(prisma.squadMember.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([])

    // Mock sprint creation
    vi.mocked(prisma.sprint.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'inactive-sprint',
      name: 'Sprint for Inactive Squad',
      squadId: 'inactive-squad',
      startDate: new Date('2025-10-01T09:00:00Z'),
      endDate: new Date('2025-10-15T17:00:00Z'),
      createdAt: new Date('2025-09-26T10:00:00Z')
    })

    const requestBody = {
      name: 'Sprint for Inactive Squad',
      squadId: 'inactive-squad',
      startDate: '2025-10-01T09:00:00Z',
      endDate: '2025-10-15T17:00:00Z'
    }

    // Mock no overlapping sprints
  vi.mocked(prisma.sprint.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    // Mock transaction for successful creation
    vi.mocked(prisma.$transaction as unknown as ReturnType<typeof vi.fn>).mockImplementation(async (callback) => {
      const result = await callback(prisma)
      return {
        sprint: result.sprint,
        memberCount: 0,
        squadName: 'Squad with Inactive Members'
      }
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
    const responseData = JSON.parse(res._getData())

    expect(responseData).toHaveProperty('memberCount', 0)

    // Verify the system treats inactive members same as empty squad
    expect(prisma.squadMember.findMany).toHaveBeenCalled()
  })
})