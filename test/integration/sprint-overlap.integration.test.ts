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
        findFirst: vi.fn(),
        create: vi.fn(),
        findMany: vi.fn()
      },
      squad: {
        findUnique: vi.fn(),
        findMany: vi.fn()
      },
      squadMember: {
        findMany: vi.fn()
      },
      sprintMember: {
        createMany: vi.fn()
      },
      $transaction: vi.fn()
    }
  }
})

import { prisma } from '../../lib/prisma'

describe('Sprint Creation - Overlap Prevention Integration', () => {
  beforeEach(() => {
    ;(getServerSession as any).mockReset()
    ;(prisma.sprint.findFirst as any).mockReset()
    ;(prisma.squad.findUnique as any).mockReset()
    ;(prisma.squadMember.findMany as any).mockReset()
    ;(prisma.sprintMember.createMany as any).mockReset()
    ;(prisma.$transaction as any).mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should prevent creation of overlapping sprints', async () => {
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
      id: 'squad-123',
      name: 'Test Squad',
      scrumMasterId: 'user-1'
    })

    // Mock existing overlapping sprint
    ;(prisma.sprint.findFirst as any).mockResolvedValue({
      id: 'existing-sprint',
      name: 'Sprint 2025.09',
      startDate: new Date('2025-09-16T09:00:00Z'),
      endDate: new Date('2025-09-30T17:00:00Z')
    })

    const requestBody = {
      name: 'Overlapping Sprint',
      squadId: 'squad-123',
      startDate: '2025-09-20T09:00:00Z', // Overlaps with existing sprint
      endDate: '2025-10-04T17:00:00Z'
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

    expect(res._getStatusCode()).toBe(409)
    const responseData = JSON.parse(res._getData())
    expect(responseData.error).toContain('overlap')
    expect(responseData.error).toContain('Sprint 2025.09')

    // Verify overlap check was performed
    expect(prisma.sprint.findFirst).toHaveBeenCalledWith({
      where: {
        squadId: 'squad-123',
        OR: [
          {
            AND: [
              { startDate: { lte: new Date('2025-09-20T09:00:00Z') } },
              { endDate: { gt: new Date('2025-09-20T09:00:00Z') } }
            ]
          },
          {
            AND: [
              { startDate: { lt: new Date('2025-10-04T17:00:00Z') } },
              { endDate: { gte: new Date('2025-10-04T17:00:00Z') } }
            ]
          },
          {
            AND: [
              { startDate: { gte: new Date('2025-09-20T09:00:00Z') } },
              { endDate: { lte: new Date('2025-10-04T17:00:00Z') } }
            ]
          }
        ]
      }
    })

    // Transaction should not be called due to overlap
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('should allow creation when no overlap exists', async () => {
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
      id: 'squad-123',
      name: 'Test Squad',
      scrumMasterId: 'user-1'
    })

    // Mock no overlapping sprints
    ;(prisma.sprint.findFirst as any).mockResolvedValue(null)

    const requestBody = {
      name: 'Non-overlapping Sprint',
      squadId: 'squad-123',
      startDate: '2025-10-16T09:00:00Z', // After existing sprint ends
      endDate: '2025-10-30T17:00:00Z'
    }

    // Mock squad members for population
    ;(prisma.squadMember.findMany as any).mockResolvedValue([
      { userId: 'member-1' },
      { userId: 'member-2' }
    ])

    // Mock transaction for successful creation
    ;(prisma.$transaction as any).mockImplementation(async (callback) => {
      const result = await callback(prisma)
      return {
        sprint: result.sprint,
        memberCount: 2,
        squadName: 'Test Squad'
      }
    })

    // Mock sprint creation
    ;(prisma.sprint.create as any).mockResolvedValue({
      id: 'new-sprint-123',
      name: 'Non-overlapping Sprint',
      squadId: 'squad-123',
      startDate: new Date('2025-10-16T09:00:00Z'),
      endDate: new Date('2025-10-30T17:00:00Z'),
      createdAt: new Date('2025-09-28T10:00:00Z')
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
    expect(responseData.id).toBe('new-sprint-123')
    expect(responseData.name).toBe('Non-overlapping Sprint')

    // Verify overlap check was performed and found no conflicts
    expect(prisma.sprint.findFirst).toHaveBeenCalled()

    // Verify transaction was called for creation
    expect(prisma.$transaction).toHaveBeenCalled()

    // Verify sprint was created
    expect(prisma.sprint.create).toHaveBeenCalledWith({
      data: {
        name: 'Non-overlapping Sprint',
        squadId: 'squad-123',
        startDate: new Date('2025-10-16T09:00:00Z'),
        endDate: new Date('2025-10-30T17:00:00Z'),
        status: 'INACTIVE'
      }
    })

    // Verify members were populated
    expect(prisma.sprintMember.createMany).toHaveBeenCalledWith({
      data: [
        { sprintId: 'new-sprint-123', userId: 'member-1' },
        { sprintId: 'new-sprint-123', userId: 'member-2' }
      ]
    })
  })
})