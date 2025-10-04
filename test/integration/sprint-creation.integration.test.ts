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
      user: {
        findUnique: vi.fn()
      },
      sprint: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn()
      },
      sprintMember: {
        createMany: vi.fn()
      },
      squadMember: {
        findMany: vi.fn()
      },
      squad: {
        findUnique: vi.fn()
      },
      $transaction: vi.fn()
    }
  }
})

import { prisma } from '../../lib/prisma'

describe('Sprint Creation - Happy Path Integration', () => {
  beforeEach(() => {
    ;(getServerSession as any).mockReset()
    ;(prisma.user.findUnique as any).mockReset()
    ;(prisma.sprint.create as any).mockReset()
    ;(prisma.sprintMember.createMany as any).mockReset()
    ;(prisma.squadMember.findMany as any).mockReset()
    ;(prisma.squad.findUnique as any).mockReset()
    ;(prisma.$transaction as any).mockReset()

    // Mock $transaction to execute the callback
    ;(prisma.$transaction as any).mockImplementation(async (callback) => {
      return await callback(prisma)
    })

    // Mock user lookup to return a valid Scrum Master
    ;(prisma.user.findUnique as any).mockResolvedValue({
      id: 'user-1',
      email: 'scrum.master@example.com',
      role: 'SCRUM_MASTER'
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should create sprint with automatic member population', async () => {
    // Mock authenticated Scrum Master
    ;(getServerSession as any).mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'scrum.master@example.com',
        role: 'SCRUM_MASTER'
      }
    })

    // Mock squad ownership verification
    ;(prisma.squad.findUnique as any).mockResolvedValue({
      id: 'squad-123',
      name: 'Test Squad',
      scrumMasterId: 'user-1'
    })

    // Mock active squad members
    ;(prisma.squadMember.findMany as any).mockResolvedValue([
      { userId: 'user-2', user: { displayName: 'John Doe', email: 'john@example.com' } },
      { userId: 'user-3', user: { displayName: 'Jane Smith', email: 'jane@example.com' } },
      { userId: 'user-4', user: { displayName: 'Bob Johnson', email: 'bob@example.com' } }
    ])

    // Mock no overlapping sprints
    ;(prisma.sprint.findFirst as any).mockResolvedValue(null)

    // Mock sprint creation
    ;(prisma.sprint.create as any).mockResolvedValue({
      id: 'sprint-456',
      name: 'Sprint 2025.10',
      squadId: 'squad-123',
      startDate: new Date('2025-10-01T09:00:00Z'),
      endDate: new Date('2025-10-15T17:00:00Z'),
      createdAt: new Date('2025-09-26T10:00:00Z')
    })

    // Mock member creation
    ;(prisma.sprintMember.createMany as any).mockResolvedValue({ count: 3 })

    const requestBody = {
      name: 'Sprint 2025.10',
      squadId: 'squad-123',
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
    await handler.default(req as any, res as any)

    expect(res._getStatusCode()).toBe(201)
    const responseData = JSON.parse(res._getData())

    expect(responseData).toHaveProperty('id', 'sprint-456')
    expect(responseData).toHaveProperty('name', 'Sprint 2025.10')
    expect(responseData).toHaveProperty('squadId', 'squad-123')
    expect(responseData).toHaveProperty('squadName', 'Test Squad')
    expect(responseData).toHaveProperty('memberCount', 3)
    expect(responseData).toHaveProperty('startDate')
    expect(responseData).toHaveProperty('endDate')

    // Verify database calls
    expect(prisma.squad.findUnique).toHaveBeenCalledWith({
      where: { id: 'squad-123' }
    })

    expect(prisma.squadMember.findMany).toHaveBeenCalledWith({
      where: { squadId: 'squad-123' },
      include: { user: { select: { displayName: true, email: true } } }
    })

    expect(prisma.sprint.findFirst).toHaveBeenCalled()

    expect(prisma.sprint.create).toHaveBeenCalledWith({
      data: {
        name: 'Sprint 2025.10',
        squadId: 'squad-123',
        startDate: new Date('2025-10-01T09:00:00Z'),
        endDate: new Date('2025-10-15T17:00:00Z'),
        status: 'INACTIVE'
      }
    })

    expect(prisma.sprintMember.createMany).toHaveBeenCalledWith({
      data: [
        { sprintId: 'sprint-456', userId: 'user-2' },
        { sprintId: 'sprint-456', userId: 'user-3' },
        { sprintId: 'sprint-456', userId: 'user-4' }
      ]
    })
  })
})