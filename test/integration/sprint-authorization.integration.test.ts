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

describe('Sprint Creation - Authorization Integration', () => {
  beforeEach(() => {
    ;(getServerSession as any).mockReset()
    ;(prisma.squad.findUnique as any).mockReset()
    ;(prisma.sprint.create as any).mockReset()
    ;(prisma.sprint.findFirst as any).mockReset()
    ;(prisma.squadMember.findMany as any).mockReset()
    ;(prisma.sprintMember.createMany as any).mockReset()
    ;(prisma.$transaction as any).mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should allow Scrum Master to create sprint for owned squad', async () => {
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
    ;(prisma.sprint.findFirst as any).mockResolvedValue(null)

    // Mock squad members for population
    ;(prisma.squadMember.findMany as any).mockResolvedValue([
      { userId: 'member-1' }
    ])

    // Mock transaction for successful creation
    ;(prisma.$transaction as any).mockImplementation(async (callback) => {
      const result = await callback(prisma)
      return {
        sprint: result.sprint,
        memberCount: 1,
        squadName: 'Owned Squad'
      }
    })

    // Mock sprint creation
    ;(prisma.sprint.create as any).mockResolvedValue({
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
    await handler.default(req as any, res as any)

    expect(res._getStatusCode()).toBe(201)

    // Verify ownership check was performed
    expect(prisma.squad.findUnique).toHaveBeenCalledWith({
      where: { id: 'owned-squad' }
    })
  })

  it('should deny regular member from creating sprint', async () => {
    // Mock authenticated regular member
    ;(getServerSession as any).mockResolvedValue({
      user: {
        id: 'user-2',
        email: 'regular.member@example.com',
        role: 'MEMBER'
      }
    })

    // Mock squad exists but user doesn't own it
    ;(prisma.squad.findUnique as any).mockResolvedValue({
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
    await handler.default(req as any, res as any)

    expect(res._getStatusCode()).toBe(403)
    const responseData = JSON.parse(res._getData())
    expect(responseData.error).toContain('Access denied')
  })

  it('should deny Scrum Master from creating sprint for unowned squad', async () => {
    // Mock authenticated Scrum Master
    ;(getServerSession as any).mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'scrum.master@example.com',
        role: 'SCRUM_MASTER'
      }
    })

    // Mock squad ownership by different Scrum Master
    ;(prisma.squad.findUnique as any).mockResolvedValue({
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
    await handler.default(req as any, res as any)

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
    ;(getServerSession as any).mockResolvedValue(null)

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
    await handler.default(req as any, res as any)

    expect(res._getStatusCode()).toBe(401)
    const responseData = JSON.parse(res._getData())
    expect(responseData.error).toContain('unauthenticated')
  })

  it('should deny access to non-existent squad', async () => {
    // Mock authenticated Scrum Master
    ;(getServerSession as any).mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'scrum.master@example.com',
        role: 'SCRUM_MASTER'
      }
    })

    // Mock squad not found
    ;(prisma.squad.findUnique as any).mockResolvedValue(null)

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
    await handler.default(req as any, res as any)

    expect(res._getStatusCode()).toBe(404)
    const responseData = JSON.parse(res._getData())
    expect(responseData.error).toContain('not found')
  })
})