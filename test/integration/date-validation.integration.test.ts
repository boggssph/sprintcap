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
      squad: {
        findUnique: vi.fn()
      },
      squadMember: {
        findMany: vi.fn()
      },
      sprint: {
        findFirst: vi.fn(),
        create: vi.fn()
      },
      sprintMember: {
        createMany: vi.fn()
      },
      $transaction: vi.fn()
    }
  }
})

import { prisma } from '../../lib/prisma'

describe('Sprint Creation - Date Validation Integration', () => {
  beforeEach(() => {
  vi.mocked(getServerSession as unknown as ReturnType<typeof vi.fn>).mockReset()
  vi.mocked(prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockReset()
  vi.mocked(prisma.squad.findUnique as unknown as ReturnType<typeof vi.fn>).mockReset()
  vi.mocked(prisma.squadMember.findMany as unknown as ReturnType<typeof vi.fn>).mockReset()
  vi.mocked(prisma.sprint.findFirst as unknown as ReturnType<typeof vi.fn>).mockReset()
  vi.mocked(prisma.sprint.create as unknown as ReturnType<typeof vi.fn>).mockReset()
  vi.mocked(prisma.sprintMember.createMany as unknown as ReturnType<typeof vi.fn>).mockReset()
  vi.mocked(prisma.$transaction as unknown as ReturnType<typeof vi.fn>).mockReset()

     // Mock user lookup to return a valid Scrum Master
  vi.mocked(prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'user-1',
      email: 'scrum.master@example.com',
      role: 'SCRUM_MASTER'
     })

    // Mock $transaction to execute the callback
    vi.mocked(prisma.$transaction as unknown as ReturnType<typeof vi.fn>).mockImplementation(async (callback) => {
      return await callback(prisma)
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should reject sprint with end date before start date', async () => {
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
      id: 'squad-123',
      name: 'Test Squad',
      scrumMasterId: 'user-1'
    })

    const requestBody = {
      name: 'Invalid Date Sprint',
      squadId: 'squad-123',
      startDate: '2025-10-15T17:00:00Z',
      endDate: '2025-10-01T09:00:00Z' // End before start
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

    expect(res._getStatusCode()).toBe(400)
    const responseData = JSON.parse(res._getData())
    expect(responseData.error).toContain('End date must be after start date')

    // Note: Validation happens before database calls, so squad ownership is not checked
  })

  it('should reject sprint with invalid date format', async () => {
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
      id: 'squad-123',
      name: 'Test Squad',
      scrumMasterId: 'user-1'
    })

    const requestBody = {
      name: 'Invalid Format Sprint',
      squadId: 'squad-123',
      startDate: 'not-a-date',
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

    expect(res._getStatusCode()).toBe(400)
    const responseData = JSON.parse(res._getData())
    expect(responseData.error).toContain('Start date must be a valid ISO date string')
  })

  it('should accept valid date range', async () => {
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
      id: 'squad-123',
      name: 'Test Squad',
      scrumMasterId: 'user-1'
    })

    // Mock squad members
    vi.mocked(prisma.squadMember.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      { userId: 'user-2' }
    ])

    // Mock no overlapping sprints
  vi.mocked(prisma.sprint.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    // Mock sprint creation
    vi.mocked(prisma.sprint.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'sprint-456',
      name: 'Valid Date Sprint',
      squadId: 'squad-123',
      startDate: new Date('2025-10-01T09:00:00Z'),
      endDate: new Date('2025-10-15T17:00:00Z'),
      createdAt: new Date()
    })

  vi.mocked(prisma.sprintMember.createMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 1 })

    const requestBody = {
      name: 'Valid Date Sprint',
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

    // Verify squad ownership was checked
    expect(prisma.squad.findUnique).toHaveBeenCalledWith({
      where: { id: 'squad-123' }
    })
  })

  it('should accept same-day sprint (start and end on same day)', async () => {
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
      id: 'squad-123',
      name: 'Test Squad',
      scrumMasterId: 'user-1'
    })

    // Mock squad members
    vi.mocked(prisma.squadMember.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      { userId: 'user-2' }
    ])

    // Mock no overlapping sprints
    vi.mocked(prisma.sprint.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    // Mock sprint creation
    vi.mocked(prisma.sprint.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'sprint-456',
      name: 'One Day Sprint',
      squadId: 'squad-123',
      startDate: new Date('2025-10-01T09:00:00Z'),
      endDate: new Date('2025-10-01T17:00:00Z'),
      createdAt: new Date()
    })

    vi.mocked(prisma.sprintMember.createMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 1 })

    const requestBody = {
      name: 'One Day Sprint',
      squadId: 'squad-123',
      startDate: '2025-10-01T09:00:00Z',
      endDate: '2025-10-01T17:00:00Z' // Same day, different time
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

    // Verify date validation allows same-day sprints
    expect(prisma.squad.findUnique).toHaveBeenCalledWith({
      where: { id: 'squad-123' }
    })
  })
})