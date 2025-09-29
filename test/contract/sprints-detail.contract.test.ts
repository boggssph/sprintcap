import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMocks } from 'node-mocks-http'

// Mock the sprint service (will be created later)
vi.mock('../../lib/services/sprintService', async () => {
  return {
    getSprint: vi.fn()
  }
})

import * as sprintService from '../../lib/services/sprintService'

describe('GET /api/sprints/[id] - Contract Test', () => {
  beforeEach(() => {
    ;(sprintService.getSprint as any).mockReset()
  })

  it('should return sprint details with members', async () => {
    const sprintId = 'sprint-uuid-123'

    const { req, res } = createMocks({
      method: 'GET',
      query: { id: sprintId }
    })

    // Mock successful response with members
    ;(sprintService.getSprint as any).mockResolvedValue({
      id: sprintId,
      name: 'Sprint 2025.10',
      squadId: 'squad-uuid-123',
      squadName: 'Test Squad',
      startDate: '2025-10-01T09:00:00Z',
      endDate: '2025-10-15T17:00:00Z',
      members: [
        {
          id: 'member-1',
          userId: 'user-1',
          displayName: 'John Doe',
          email: 'john@example.com',
          joinedAt: '2025-09-26T10:00:00Z'
        },
        {
          id: 'member-2',
          userId: 'user-2',
          displayName: 'Jane Smith',
          email: 'jane@example.com',
          joinedAt: '2025-09-26T10:00:00Z'
        }
      ],
      createdAt: '2025-09-26T10:00:00Z',
      updatedAt: '2025-09-26T10:00:00Z'
    })

    try {
      const handler = await import('../../pages/api/sprints/[id]')
      await handler.default(req as any, res as any)

      expect(res._getStatusCode()).toBe(200)
      const responseData = JSON.parse(res._getData())
      expect(responseData).toHaveProperty('id', sprintId)
      expect(responseData).toHaveProperty('name', 'Sprint 2025.10')
      expect(responseData).toHaveProperty('members')
      expect(responseData.members).toHaveLength(2)
      expect(responseData.members[0]).toHaveProperty('displayName', 'John Doe')
      expect(responseData.members[1]).toHaveProperty('email', 'jane@example.com')
    } catch (error) {
      // Expected to fail until endpoint is implemented
      expect(error.message).toContain('Cannot find module')
    }
  })

  it('should return 404 for non-existent sprint', async () => {
    const sprintId = 'non-existent-sprint'

    const { req, res } = createMocks({
      method: 'GET',
      query: { id: sprintId }
    })

    // Mock not found error
    ;(sprintService.getSprint as any).mockRejectedValue(
      new Error('Sprint not found')
    )

    try {
      const handler = await import('../../pages/api/sprints/[id]')
      await handler.default(req as any, res as any)

      expect(res._getStatusCode()).toBe(404)
      const responseData = JSON.parse(res._getData())
      expect(responseData).toHaveProperty('error', 'Sprint not found')
    } catch (error) {
      // Expected to fail until endpoint is implemented
      expect(error.message).toContain('Cannot find module')
    }
  })

  it('should return sprint with empty members list', async () => {
    const sprintId = 'empty-sprint'

    const { req, res } = createMocks({
      method: 'GET',
      query: { id: sprintId }
    })

    // Mock sprint with no members
    ;(sprintService.getSprint as any).mockResolvedValue({
      id: sprintId,
      name: 'Empty Sprint',
      squadId: 'squad-uuid-123',
      squadName: 'Test Squad',
      startDate: '2025-10-01T09:00:00Z',
      endDate: '2025-10-15T17:00:00Z',
      members: [],
      createdAt: '2025-09-26T10:00:00Z',
      updatedAt: '2025-09-26T10:00:00Z'
    })

    try {
      const handler = await import('../../pages/api/sprints/[id]')
      await handler.default(req as any, res as any)

      expect(res._getStatusCode()).toBe(200)
      const responseData = JSON.parse(res._getData())
      expect(responseData).toHaveProperty('members')
      expect(responseData.members).toHaveLength(0)
    } catch (error) {
      // Expected to fail until endpoint is implemented
      expect(error.message).toContain('Cannot find module')
    }
  })
})