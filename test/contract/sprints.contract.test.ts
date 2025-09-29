import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMocks } from 'node-mocks-http'

// Mock next-auth
vi.mock('next-auth', async () => {
  return {
    getServerSession: vi.fn()
  }
})

// Mock the sprint service (will be created later)
vi.mock('../../lib/services/sprintService', async () => {
  return {
    createSprint: vi.fn()
  }
})

import { getServerSession } from 'next-auth'
import * as sprintService from '../../lib/services/sprintService'

describe('POST /api/sprints - Contract Test', () => {
  beforeEach(() => {
    ;(sprintService.createSprint as any).mockReset()
    ;(getServerSession as any).mockResolvedValue({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'SCRUM_MASTER'
      }
    })
  })

  it('should accept valid sprint creation request', async () => {
    // This test will fail until the endpoint is implemented
    const requestBody = {
      name: 'Sprint 2025.10',
      squadId: 'squad-uuid-123',
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

    // Mock successful creation
    ;(sprintService.createSprint as any).mockResolvedValue({
      id: 'sprint-uuid',
      name: 'Sprint 2025.10',
      squadId: 'squad-uuid-123',
      squadName: 'Test Squad',
      startDate: '2025-10-01T09:00:00Z',
      endDate: '2025-10-15T17:00:00Z',
      memberCount: 3,
      createdAt: '2025-09-26T10:00:00Z'
    })

    // Import and test the handler
    const handler = await import('../../pages/api/sprints')
    await handler.default(req as any, res as any)

    expect(res._getStatusCode()).toBe(201)
    const responseData = JSON.parse(res._getData())
    expect(responseData).toHaveProperty('id')
    expect(responseData).toHaveProperty('name', 'Sprint 2025.10')
    expect(responseData).toHaveProperty('squadId', 'squad-uuid-123')
    expect(responseData).toHaveProperty('memberCount', 3)
  })

  it('should return 400 for invalid date range', async () => {
    const requestBody = {
      name: 'Invalid Sprint',
      squadId: 'squad-uuid-123',
      startDate: '2025-10-15T09:00:00Z', // End date before start date
      endDate: '2025-10-01T17:00:00Z'
    }

    const { req, res } = createMocks({
      method: 'POST',
      body: requestBody,
      headers: {
        'content-type': 'application/json'
      }
    })

    // Mock validation error
    ;(sprintService.createSprint as any).mockRejectedValue(
      Object.assign(new Error('End date must be after start date'), { code: 'VALIDATION_ERROR' })
    )

    const handler = await import('../../pages/api/sprints')
    await handler.default(req as any, res as any)

    expect(res._getStatusCode()).toBe(400)
    const responseData = JSON.parse(res._getData())
    expect(responseData).toHaveProperty('error', 'End date must be after start date')
  })

  it('should return 400 for overlapping sprint', async () => {
    const requestBody = {
      name: 'Overlapping Sprint',
      squadId: 'squad-uuid-123',
      startDate: '2025-09-20T09:00:00Z',
      endDate: '2025-10-04T17:00:00Z'
    }

    const { req, res } = createMocks({
      method: 'POST',
      body: requestBody,
      headers: {
        'content-type': 'application/json'
      }
    })

    // Mock overlap error
    ;(sprintService.createSprint as any).mockRejectedValue(
      Object.assign(new Error('Sprint dates overlap with existing sprint \'Sprint 2025.09\''), { code: 'CONFLICT' })
    )

    const handler = await import('../../pages/api/sprints')
    await handler.default(req as any, res as any)

    expect(res._getStatusCode()).toBe(409)
    const responseData = JSON.parse(res._getData())
    expect(responseData.error).toContain('overlap')
  })
})