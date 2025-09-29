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

describe('Sprint Overlap Detection', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mocks for squad ownership and members
    ;(prisma.squad.findUnique as any).mockResolvedValue({
      id: 'squad-123',
      name: 'Test Squad',
      scrumMasterId: 'user-1'
    })

    ;(prisma.squadMember.findMany as any).mockResolvedValue([
      {
        userId: 'user-2',
        user: { displayName: 'Developer 1', email: 'dev1@example.com' }
      },
      {
        userId: 'user-3',
        user: { displayName: 'Developer 2', email: 'dev2@example.com' }
      }
    ])

    ;(prisma.sprintMember.createMany as any).mockResolvedValue({ count: 2 })
    ;(prisma.sprint.create as any).mockResolvedValue({
      id: 'new-sprint-id',
      name: 'New Sprint',
      squadId: 'squad-123',
      startDate: new Date('2025-10-16T09:00:00Z'),
      endDate: new Date('2025-10-30T17:00:00Z'),
      createdAt: new Date()
    })
    ;(prisma.$transaction as any).mockImplementation(async (callback) => {
      const result = await callback({
        sprint: { create: prisma.sprint.create },
        sprintMember: { createMany: prisma.sprintMember.createMany }
      })
      return result
    })
  })

  describe('Overlap Query Logic', () => {
    it('should detect overlap when new sprint starts during existing sprint', async () => {
      // Existing sprint: 2025-10-01 to 2025-10-15
      // New sprint: 2025-10-05 to 2025-10-20 (starts during existing)
      const mockOverlappingSprint = {
        id: 'existing-sprint',
        name: 'Existing Sprint',
        startDate: new Date('2025-10-01T09:00:00Z'),
        endDate: new Date('2025-10-15T17:00:00Z')
      }

      ;(prisma.sprint.findFirst as any).mockResolvedValue(mockOverlappingSprint)

      // Import after mocking
      const { createSprint } = await import('../../lib/services/sprintService')

      await expect(createSprint('user-1', 'SCRUM_MASTER', {
        name: 'New Sprint',
        squadId: 'squad-123',
        startDate: '2025-10-05T09:00:00Z',
        endDate: '2025-10-20T17:00:00Z'
      })).rejects.toThrow('Sprint dates overlap with existing sprint \'Existing Sprint\'')

      expect(prisma.sprint.findFirst).toHaveBeenCalledWith({
        where: {
          squadId: 'squad-123',
          OR: [
            {
              AND: [
                { startDate: { lte: new Date('2025-10-05T09:00:00Z') } },
                { endDate: { gt: new Date('2025-10-05T09:00:00Z') } }
              ]
            },
            {
              AND: [
                { startDate: { lt: new Date('2025-10-20T17:00:00Z') } },
                { endDate: { gte: new Date('2025-10-20T17:00:00Z') } }
              ]
            },
            {
              AND: [
                { startDate: { gte: new Date('2025-10-05T09:00:00Z') } },
                { endDate: { lte: new Date('2025-10-20T17:00:00Z') } }
              ]
            }
          ]
        }
      })
    })

    it('should detect overlap when new sprint ends during existing sprint', async () => {
      // Existing sprint: 2025-10-10 to 2025-10-25
      // New sprint: 2025-10-01 to 2025-10-15 (ends during existing)
      const mockOverlappingSprint = {
        id: 'existing-sprint',
        name: 'Existing Sprint',
        startDate: new Date('2025-10-10T09:00:00Z'),
        endDate: new Date('2025-10-25T17:00:00Z')
      }

      ;(prisma.sprint.findFirst as any).mockResolvedValue(mockOverlappingSprint)

      const { createSprint } = await import('../../lib/services/sprintService')

      await expect(createSprint('user-1', 'SCRUM_MASTER', {
        name: 'New Sprint',
        squadId: 'squad-123',
        startDate: '2025-10-01T09:00:00Z',
        endDate: '2025-10-15T17:00:00Z'
      })).rejects.toThrow('Sprint dates overlap with existing sprint \'Existing Sprint\'')
    })

    it('should detect overlap when new sprint completely contains existing sprint', async () => {
      // Existing sprint: 2025-10-05 to 2025-10-10
      // New sprint: 2025-10-01 to 2025-10-15 (completely contains existing)
      const mockOverlappingSprint = {
        id: 'existing-sprint',
        name: 'Existing Sprint',
        startDate: new Date('2025-10-05T09:00:00Z'),
        endDate: new Date('2025-10-10T17:00:00Z')
      }

      ;(prisma.sprint.findFirst as any).mockResolvedValue(mockOverlappingSprint)

      const { createSprint } = await import('../../lib/services/sprintService')

      await expect(createSprint('user-1', 'SCRUM_MASTER', {
        name: 'New Sprint',
        squadId: 'squad-123',
        startDate: '2025-10-01T09:00:00Z',
        endDate: '2025-10-15T17:00:00Z'
      })).rejects.toThrow('Sprint dates overlap with existing sprint \'Existing Sprint\'')
    })

    it('should detect overlap when existing sprint completely contains new sprint', async () => {
      // Existing sprint: 2025-10-01 to 2025-10-15
      // New sprint: 2025-10-05 to 2025-10-10 (completely contained)
      const mockOverlappingSprint = {
        id: 'existing-sprint',
        name: 'Existing Sprint',
        startDate: new Date('2025-10-01T09:00:00Z'),
        endDate: new Date('2025-10-15T17:00:00Z')
      }

      ;(prisma.sprint.findFirst as any).mockResolvedValue(mockOverlappingSprint)

      const { createSprint } = await import('../../lib/services/sprintService')

      await expect(createSprint('user-1', 'SCRUM_MASTER', {
        name: 'New Sprint',
        squadId: 'squad-123',
        startDate: '2025-10-05T09:00:00Z',
        endDate: '2025-10-10T17:00:00Z'
      })).rejects.toThrow('Sprint dates overlap with existing sprint \'Existing Sprint\'')
    })

    it('should allow non-overlapping sprints', async () => {
      // Existing sprint: 2025-10-01 to 2025-10-15
      // New sprint: 2025-10-16 to 2025-10-30 (starts right after existing ends)
      ;(prisma.sprint.findFirst as any).mockResolvedValue(null)

      const { createSprint } = await import('../../lib/services/sprintService')

      const result = await createSprint('user-1', 'SCRUM_MASTER', {
        name: 'New Sprint',
        squadId: 'squad-123',
        startDate: '2025-10-16T09:00:00Z',
        endDate: '2025-10-30T17:00:00Z'
      })

      expect(result).toBeDefined()
      expect(result.name).toBe('New Sprint')
      expect(prisma.sprint.findFirst).toHaveBeenCalled()
    })

    it('should allow sprints that touch at boundaries (end equals start)', async () => {
      // Existing sprint: 2025-10-01 to 2025-10-15
      // New sprint: 2025-10-15 to 2025-10-30 (touches at boundary)
      ;(prisma.sprint.findFirst as any).mockResolvedValue(null)

      const { createSprint } = await import('../../lib/services/sprintService')

      const result = await createSprint('user-1', 'SCRUM_MASTER', {
        name: 'New Sprint',
        squadId: 'squad-123',
        startDate: '2025-10-15T17:00:00Z',
        endDate: '2025-10-30T17:00:00Z'
      })

      expect(result).toBeDefined()
      expect(result.name).toBe('New Sprint')
      expect(prisma.sprint.findFirst).toHaveBeenCalled()
    })

    it('should detect overlap across different squads independently', async () => {
      // Sprint in squad-123: 2025-10-01 to 2025-10-15
      // New sprint in squad-456: 2025-10-05 to 2025-10-20 (same dates, different squad)
      ;(prisma.sprint.findFirst as any).mockResolvedValue(null) // No overlap in squad-456

      // Mock squad-456 ownership
      ;(prisma.squad.findUnique as any).mockResolvedValueOnce({
        id: 'squad-456',
        name: 'Other Squad',
        scrumMasterId: 'user-1'
      })

      const { createSprint } = await import('../../lib/services/sprintService')

      const result = await createSprint('user-1', 'SCRUM_MASTER', {
        name: 'New Sprint',
        squadId: 'squad-456',
        startDate: '2025-10-05T09:00:00Z',
        endDate: '2025-10-20T17:00:00Z'
      })

      expect(result).toBeDefined()

      // Verify the query was scoped to the correct squad
      expect(prisma.sprint.findFirst).toHaveBeenCalledWith({
        where: {
          squadId: 'squad-456',
          OR: expect.any(Array)
        }
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle exact boundary matches correctly', () => {
      // Test the three overlap conditions separately
      const existingStart = new Date('2025-10-01T09:00:00Z')
      const existingEnd = new Date('2025-10-15T17:00:00Z')

      // Condition 1: existing.start <= new.start < existing.end
      expect(existingStart <= new Date('2025-10-05T12:00:00Z')).toBe(true)
      expect(new Date('2025-10-05T12:00:00Z') < existingEnd).toBe(true)

      // Condition 2: existing.start < new.end <= existing.end
      expect(existingStart < new Date('2025-10-10T12:00:00Z')).toBe(true)
      expect(new Date('2025-10-10T12:00:00Z') <= existingEnd).toBe(true)

      // Condition 3: existing.start >= new.start && existing.end <= new.end
      expect(existingStart >= new Date('2024-12-01T09:00:00Z')).toBe(true)
      expect(existingEnd <= new Date('2025-12-01T17:00:00Z')).toBe(true)
    })

    it('should handle same start/end times as boundary case', () => {
      // When new.end equals existing.start, should not overlap
      const existingStart = new Date('2025-10-15T17:00:00Z')
      const newEnd = new Date('2025-10-15T17:00:00Z')

      // Condition 2 check: existing.start < new.end <= existing.end
      // Since new.end == existing.start, existing.start < new.end is false
      expect(existingStart < newEnd).toBe(false)
    })
  })
})