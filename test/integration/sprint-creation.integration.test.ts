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
  vi.mocked(getServerSession as unknown as ReturnType<typeof vi.fn>).mockReset()
  vi.mocked(prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockReset()
  vi.mocked(prisma.sprint.create as unknown as ReturnType<typeof vi.fn>).mockReset()
  vi.mocked(prisma.sprintMember.createMany as unknown as ReturnType<typeof vi.fn>).mockReset()
  vi.mocked(prisma.squadMember.findMany as unknown as ReturnType<typeof vi.fn>).mockReset()
  vi.mocked(prisma.squad.findUnique as unknown as ReturnType<typeof vi.fn>).mockReset()
  vi.mocked(prisma.$transaction as unknown as ReturnType<typeof vi.fn>).mockReset()

    // Mock $transaction to execute the callback
    vi.mocked(prisma.$transaction as unknown as ReturnType<typeof vi.fn>).mockImplementation(async (callback) => {
      return await callback(prisma)
    })

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

  it('should create sprint with automatic member population', async () => {
    // Mock authenticated Scrum Master
    vi.mocked(getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'scrum.master@example.com',
        role: 'SCRUM_MASTER'
      }
    })

    // Mock squad ownership verification
    vi.mocked(prisma.squad.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'squad-123',
      name: 'Test Squad',
      scrumMasterId: 'user-1'
    })

    // Mock active squad members
    vi.mocked(prisma.squadMember.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      { userId: 'user-2', user: { displayName: 'John Doe', email: 'john@example.com' } },
      { userId: 'user-3', user: { displayName: 'Jane Smith', email: 'jane@example.com' } },
      { userId: 'user-4', user: { displayName: 'Bob Johnson', email: 'bob@example.com' } }
    ])

    // Mock no overlapping sprints
  vi.mocked(prisma.sprint.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    // Mock sprint creation
    vi.mocked(prisma.sprint.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'sprint-456',
      name: 'Sprint 2025.10',
      squadId: 'squad-123',
      startDate: new Date('2025-10-01T09:00:00Z'),
      endDate: new Date('2025-10-15T17:00:00Z'),
      createdAt: new Date('2025-09-26T10:00:00Z')
    })

    // Mock member creation
  vi.mocked(prisma.sprintMember.createMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 3 })

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
  await handler.default(req as unknown as NextApiRequest, res as unknown as NextApiResponse)

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