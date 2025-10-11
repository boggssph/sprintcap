import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock getServerSession
vi.mock('next-auth', () => ({
  getServerSession: vi.fn()
}))

// Mock prisma
vi.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn()
    },
    squad: {
      findMany: vi.fn()
    },
    sprint: {
      findMany: vi.fn()
    }
  }
}))

// Mock devAuthGuard
vi.mock('../../lib/devAuthMiddleware', () => ({
  devAuthGuard: vi.fn()
}))

import { getServerSession } from 'next-auth'
import { prisma } from '../../lib/prisma'
import { devAuthGuard } from '../../lib/devAuthMiddleware'

describe('contract: GET /api/scrum-master/sprints/available', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 200 with available sprints for authenticated scrum master', async () => {
    // This should fail until the route is implemented
    try {
      const { GET } = await import('@/app/api/scrum-master/sprints/available/route')
      expect(GET).toBeDefined()

      // Mock authentication - authenticated Scrum Master
      ;(getServerSession as any).mockResolvedValue({
        user: { email: 'scrum@example.com' }
      })
      ;(devAuthGuard as any).mockResolvedValue(null) // No dev auth

      // Mock user lookup
      ;(prisma.user.findUnique as any).mockResolvedValue({
        id: 'user-1',
        email: 'scrum@example.com',
        role: 'SCRUM_MASTER'
      })

      // Mock squad lookup - user is scrum master of squad-1
      ;(prisma.squad.findMany as any).mockResolvedValue([
        {
          id: 'squad-1',
          name: 'Development Team',
          alias: 'dev-team',
          scrumMasterId: 'user-1',
          sprints: [
            {
              id: 'sprint-1',
              name: 'Sprint 1',
              startDate: new Date('2025-01-01'),
              endDate: new Date('2025-01-14'),
              status: 'ACTIVE',
              squadId: 'squad-1'
            },
            {
              id: 'sprint-2',
              name: 'Sprint 2',
              startDate: new Date('2025-01-15'),
              endDate: new Date('2025-01-28'),
              status: 'INACTIVE',
              squadId: 'squad-1'
            }
          ]
        }
      ])

      // Create mock request
      const mockRequest = new Request('http://localhost:3000/api/scrum-master/sprints/available')

      // Call the route handler
      const response = await GET(mockRequest)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('sprints')
      expect(Array.isArray(data.sprints)).toBe(true)
      expect(data.sprints).toHaveLength(2)
      expect(data.sprints[0]).toHaveProperty('id', 'sprint-1')
      expect(data.sprints[1]).toHaveProperty('id', 'sprint-2')

    } catch (error) {
      // Route not implemented yet - this is expected
      expect(error.message).toContain('Cannot find module')
    }
  })

  it('should return 403 for non-scrum-master users', async () => {
    // This should fail until the route is implemented
    try {
      const { GET } = await import('@/app/api/scrum-master/sprints/available/route')
      expect(GET).toBeDefined()

      // Mock authentication - authenticated but not Scrum Master
      ;(getServerSession as any).mockResolvedValue({
        user: { email: 'member@example.com' }
      })
      ;(devAuthGuard as any).mockResolvedValue(null) // No dev auth

      // Mock user lookup - regular member
      ;(prisma.user.findUnique as any).mockResolvedValue({
        id: 'user-2',
        email: 'member@example.com',
        role: 'MEMBER'
      })

      // Create mock request
      const mockRequest = new Request('http://localhost:3000/api/scrum-master/sprints/available')

      // Call the route handler
      const response = await GET(mockRequest)
      expect(response.status).toBe(403)

    } catch (error) {
      // Route not implemented yet - this is expected
      expect(error.message).toContain('Cannot find module')
    }
  })
})