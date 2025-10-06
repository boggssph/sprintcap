import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMocks } from 'node-mocks-http'
import type { NextApiRequest, NextApiResponse } from 'next'

// Mock the sprint service (will be created later)
vi.mock('../../lib/services/sprintService', async () => {
  return {
    getSprint: vi.fn()
  }
})

import * as sprintService from '../../lib/services/sprintService'

describe('GET /api/sprints/[id] - Contract Test', () => {
  beforeEach(() => {
    vi.mocked(sprintService.getSprint as unknown as ReturnType<typeof vi.fn>).mockReset()
  })

  it('should return sprint details with members', async () => {
    const sprintId = 'sprint-uuid-123'

    const { req, res } = createMocks({
      method: 'GET',
      query: { id: sprintId },
      headers: {
        'x-test-user': 'test@example.com'
      }
    })

    // Mock successful response with members
  vi.mocked(sprintService.getSprint as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
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

  const handler = await import('../../pages/api/sprints/[id]')
  await handler.default(req as unknown as NextApiRequest, res as unknown as NextApiResponse)

    expect(res._getStatusCode()).toBe(200)
    const responseData = JSON.parse(res._getData())
    expect(responseData).toHaveProperty('id', sprintId)
    expect(responseData).toHaveProperty('name', 'Sprint 2025.10')
    expect(responseData).toHaveProperty('members')
    expect(responseData.members).toHaveLength(2)
    expect(responseData.members[0]).toHaveProperty('displayName', 'John Doe')
    expect(responseData.members[1]).toHaveProperty('email', 'jane@example.com')
  })

  it('should return 404 for non-existent sprint', async () => {
    const sprintId = 'non-existent-sprint'

    const { req, res } = createMocks({
      method: 'GET',
      query: { id: sprintId },
      headers: {
        'x-test-user': 'test@example.com'
      }
    })

    // Mock not found error
    const notFoundError = new Error('Sprint not found')
  ;(notFoundError as unknown as { code?: string }).code = 'NOT_FOUND'
  vi.mocked(sprintService.getSprint as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(notFoundError)

  const handler = await import('../../pages/api/sprints/[id]')
  await handler.default(req as unknown as NextApiRequest, res as unknown as NextApiResponse)

    expect(res._getStatusCode()).toBe(404)
    const responseData = JSON.parse(res._getData())
    expect(responseData).toHaveProperty('error', 'Sprint not found')
  })

  it('should return sprint with empty members list', async () => {
    const sprintId = 'empty-sprint'

    const { req, res } = createMocks({
      method: 'GET',
      query: { id: sprintId },
      headers: {
        'x-test-user': 'test@example.com'
      }
    })

    // Mock sprint with no members
  vi.mocked(sprintService.getSprint as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
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

  const handler = await import('../../pages/api/sprints/[id]')
  await handler.default(req as unknown as NextApiRequest, res as unknown as NextApiResponse)

    expect(res._getStatusCode()).toBe(200)
    const responseData = JSON.parse(res._getData())
    expect(responseData).toHaveProperty('members')
    expect(responseData.members).toHaveLength(0)
  })
})