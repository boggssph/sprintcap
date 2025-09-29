import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '../../lib/prisma'

// Mock Prisma client
vi.mock('../../lib/prisma', () => ({
  prisma: {
    sprint: {
      findFirst: vi.fn(),
      create: vi.fn()
    },
    squad: {
      findUnique: vi.fn()
    },
    squadMember: {
      findMany: vi.fn()
    },
    sprintMember: {
      createMany: vi.fn()
    },
    $transaction: vi.fn()
  }
}))

describe('Sprint Creation Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mocks for successful sprint creation
    ;(prisma.squad.findUnique as any).mockResolvedValue({
      id: 'squad-1',
      name: 'Test Squad',
      scrumMasterId: 'user-1'
    })

    ;(prisma.squadMember.findMany as any).mockResolvedValue([
      { userId: 'user-2', user: { displayName: 'Dev 1', email: 'dev1@test.com' } },
      { userId: 'user-3', user: { displayName: 'Dev 2', email: 'dev2@test.com' } },
      { userId: 'user-4', user: { displayName: 'Dev 3', email: 'dev3@test.com' } },
      { userId: 'user-5', user: { displayName: 'Dev 4', email: 'dev4@test.com' } },
      { userId: 'user-6', user: { displayName: 'Dev 5', email: 'dev5@test.com' } }
    ])

    ;(prisma.sprint.findFirst as any).mockResolvedValue(null) // No overlap

    ;(prisma.sprint.create as any).mockResolvedValue({
      id: 'sprint-1',
      name: 'Performance Test Sprint',
      squadId: 'squad-1',
      startDate: new Date('2025-10-01T09:00:00Z'),
      endDate: new Date('2025-10-15T17:00:00Z'),
      createdAt: new Date()
    })

    ;(prisma.sprintMember.createMany as any).mockResolvedValue({ count: 5 })

    ;(prisma.$transaction as any).mockImplementation(async (callback) => {
      const result = await callback({
        sprint: { create: prisma.sprint.create },
        sprintMember: { createMany: prisma.sprintMember.createMany }
      })
      return result
    })
  })

  describe('Performance Benchmarks', () => {
    it('should create sprint within 500ms', async () => {
      const { createSprint } = await import('../../lib/services/sprintService')

      const startTime = performance.now()

      const result = await createSprint('user-1', 'SCRUM_MASTER', {
        name: 'Performance Test Sprint',
        squadId: 'squad-1',
        startDate: '2025-10-01T09:00:00Z',
        endDate: '2025-10-15T17:00:00Z'
      })

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(500) // Should complete within 500ms
      expect(result).toBeDefined()
      expect(result.name).toBe('Performance Test Sprint')
    })

    it('should handle concurrent sprint creation requests', async () => {
      const { createSprint } = await import('../../lib/services/sprintService')

      // Create multiple sprint creation promises
      const sprintPromises = [
        createSprint('user-1', 'SCRUM_MASTER', {
          name: 'Concurrent Sprint 1',
          squadId: 'squad-1',
          startDate: '2025-10-01T09:00:00Z',
          endDate: '2025-10-15T17:00:00Z'
        }),
        createSprint('user-1', 'SCRUM_MASTER', {
          name: 'Concurrent Sprint 2',
          squadId: 'squad-1',
          startDate: '2025-10-16T09:00:00Z',
          endDate: '2025-10-30T17:00:00Z'
        }),
        createSprint('user-1', 'SCRUM_MASTER', {
          name: 'Concurrent Sprint 3',
          squadId: 'squad-1',
          startDate: '2025-11-01T09:00:00Z',
          endDate: '2025-11-15T17:00:00Z'
        })
      ]

      const startTime = performance.now()

      const results = await Promise.all(sprintPromises)

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(1500) // Should complete within 1.5s for 3 concurrent requests
      expect(results).toHaveLength(3)
      results.forEach(result => {
        expect(result).toBeDefined()
        expect(result.id).toBeDefined()
      })
    })

    it('should maintain performance with large squad (20+ members)', async () => {
      // Mock a large squad with 25 members
      const largeSquadMembers = Array.from({ length: 25 }, (_, i) => ({
        userId: `user-${i + 2}`,
        user: {
          displayName: `Developer ${i + 1}`,
          email: `dev${i + 1}@test.com`
        }
      }))

      ;(prisma.squadMember.findMany as any).mockResolvedValue(largeSquadMembers)
      ;(prisma.sprintMember.createMany as any).mockResolvedValue({ count: 25 })

      const { createSprint } = await import('../../lib/services/sprintService')

      const startTime = performance.now()

      const result = await createSprint('user-1', 'SCRUM_MASTER', {
        name: 'Large Squad Sprint',
        squadId: 'squad-1',
        startDate: '2025-10-01T09:00:00Z',
        endDate: '2025-10-15T17:00:00Z'
      })

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(500) // Should still complete within 500ms
      expect(result).toBeDefined()
      expect(result.memberCount).toBe(25)
    })

    it('should handle overlap detection performance', async () => {
      // Mock existing sprints for overlap checking
      ;(prisma.sprint.findFirst as any).mockResolvedValue(null) // No overlap

      const { createSprint } = await import('../../lib/services/sprintService')

      const startTime = performance.now()

      // Test overlap detection specifically
      await createSprint('user-1', 'SCRUM_MASTER', {
        name: 'Overlap Test Sprint',
        squadId: 'squad-1',
        startDate: '2025-10-01T09:00:00Z',
        endDate: '2025-10-15T17:00:00Z'
      })

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(500)
      expect(prisma.sprint.findFirst).toHaveBeenCalled()
    })

    it('should handle validation performance', async () => {
      const { createSprint } = await import('../../lib/services/sprintService')

      const startTime = performance.now()

      const result = await createSprint('user-1', 'SCRUM_MASTER', {
        name: 'Validation Test Sprint',
        squadId: 'squad-1',
        startDate: '2025-10-01T09:00:00Z',
        endDate: '2025-10-15T17:00:00Z'
      })

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(500)
      expect(result).toBeDefined()
    })
  })

  describe('Memory and Resource Usage', () => {
    it('should not have memory leaks in repeated operations', async () => {
      const { createSprint } = await import('../../lib/services/sprintService')

      const iterations = 10
      const results: Array<{ duration: number; result: any }> = []

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now()

        const result = await createSprint('user-1', 'SCRUM_MASTER', {
          name: `Memory Test Sprint ${i + 1}`,
          squadId: 'squad-1',
          startDate: `2025-10-${String(i + 1).padStart(2, '0')}T09:00:00Z`,
          endDate: `2025-10-${String(i + 15).padStart(2, '0')}T17:00:00Z`
        })

        const endTime = performance.now()
        const duration = endTime - startTime

        results.push({ duration, result })

        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      // All operations should complete successfully
      expect(results).toHaveLength(iterations)
      results.forEach(({ duration, result }) => {
        expect(duration).toBeLessThan(500)
        expect(result).toBeDefined()
      })

      // Performance should be consistent (no significant degradation)
      const avgDuration = results.reduce((sum, { duration }) => sum + duration, 0) / iterations
      const maxDuration = Math.max(...results.map(({ duration }) => duration))

      expect(avgDuration).toBeLessThan(200) // Average should be well under 500ms
      expect(maxDuration).toBeLessThan(500) // Max should still be under 500ms
    })
  })

  describe('Load Testing Scenarios', () => {
    it('should handle rapid sequential requests', async () => {
      const { createSprint } = await import('../../lib/services/sprintService')

      const requestCount = 5
      const startTime = performance.now()

      for (let i = 0; i < requestCount; i++) {
        await createSprint('user-1', 'SCRUM_MASTER', {
          name: `Rapid Test Sprint ${i + 1}`,
          squadId: 'squad-1',
          startDate: `2025-10-${String(i + 1).padStart(2, '0')}T09:00:00Z`,
          endDate: `2025-10-${String(i + 15).padStart(2, '0')}T17:00:00Z`
        })
      }

      const endTime = performance.now()
      const totalDuration = endTime - startTime
      const avgDuration = totalDuration / requestCount

      expect(totalDuration).toBeLessThan(2000) // Total time for 5 requests
      expect(avgDuration).toBeLessThan(400) // Average per request
    })
  })
})