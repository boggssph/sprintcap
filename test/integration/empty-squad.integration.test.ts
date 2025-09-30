import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createMocks } from 'node-mocks-http'
import { getServerSession } from 'next-auth'

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
    ;(getServerSession as any).mockReset()
    ;(prisma.sprint.create as any).mockReset()
    ;(prisma.squadMember.findMany as any).mockReset()
    ;(prisma.squad.findUnique as any).mockReset()
    ;(prisma.sprintMember.createMany as any).mockReset()
    ;(prisma.$transaction as any).mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should create sprint successfully for squad with no active members', async () => {
    // Mock authenticated Scrum Master
    ;(getServerSession as any).mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'scrum.master@example.com',
        role: 'SCRUM_MASTER'
      }
    })

    // Mock squad ownership
    ;(prisma.squad.findUnique as any).mockResolvedValue({
      id: 'empty-squad',
      name: 'Empty Squad',
      scrumMasterId: 'user-1'
    })

    // Mock empty squad members list
    ;(prisma.squadMember.findMany as any).mockResolvedValue([])

    // Mock sprint creation
    ;(prisma.sprint.create as any).mockResolvedValue({
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
    ;(prisma.sprint.findFirst as any).mockResolvedValue(null)

    // Mock transaction for successful creation
    ;(prisma.$transaction as any).mockImplementation(async (callback) => {
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
    await handler.default(req as any, res as any)

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
    ;(getServerSession as any).mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'scrum.master@example.com',
        role: 'SCRUM_MASTER'
      }
    })

    // Mock squad ownership
    ;(prisma.squad.findUnique as any).mockResolvedValue({
      id: 'inactive-squad',
      name: 'Squad with Inactive Members',
      scrumMasterId: 'user-1'
    })

    // Mock squad members query returns empty (simulating inactive members)
    ;(prisma.squadMember.findMany as any).mockResolvedValue([])

    // Mock sprint creation
    ;(prisma.sprint.create as any).mockResolvedValue({
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
    ;(prisma.sprint.findFirst as any).mockResolvedValue(null)

    // Mock transaction for successful creation
    ;(prisma.$transaction as any).mockImplementation(async (callback) => {
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
    await handler.default(req as any, res as any)

    expect(res._getStatusCode()).toBe(201)
    const responseData = JSON.parse(res._getData())

    expect(responseData).toHaveProperty('memberCount', 0)

    // Verify the system treats inactive members same as empty squad
    expect(prisma.squadMember.findMany).toHaveBeenCalled()
  })
})