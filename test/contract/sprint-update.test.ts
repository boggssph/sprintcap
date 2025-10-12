import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock prisma
vi.mock('../../lib/prisma', async () => {
  await vi.importActual('../../lib/prisma')
  return {
    prisma: {
      sprint: {
        findUnique: vi.fn(),
        update: vi.fn()
      },
      user: {
        findUnique: vi.fn()
      }
    }
  }
})

import { updateSprint } from '../../lib/services/sprintService'
import { prisma } from '../../lib/prisma'

describe('PUT /api/sprints/[sprintId] - Contract Test', () => {
  beforeEach(() => {
    vi.mocked(prisma.sprint.findUnique).mockReset()
    vi.mocked(prisma.sprint.update).mockReset()
    vi.mocked(prisma.user.findUnique).mockReset()
  })

  it('should update sprint with valid data', async () => {
    // Mock successful sprint lookup
    vi.mocked(prisma.sprint.findUnique).mockResolvedValue({
      id: 'sprint-123',
      name: 'Original Sprint',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-15'),
      status: 'INACTIVE',
      squadId: 'squad-456',
      createdAt: new Date(),
      updatedAt: new Date(),
      squad: {
        scrumMasterId: 'user-789'
      }
    } as any)

    // Mock successful update
    vi.mocked(prisma.sprint.update).mockResolvedValue({
      id: 'sprint-123',
      name: 'Updated Sprint',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-01-29'),
      status: 'ACTIVE',
      squadId: 'squad-456',
      createdAt: new Date(),
      updatedAt: new Date()
    } as any)

    const result = await updateSprint('sprint-123', {
      name: 'Updated Sprint',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-01-29'),
      status: 'ACTIVE'
    }, 'user-789')

    expect(result).toBeDefined()
    expect(result?.name).toBe('Updated Sprint')
    expect(result?.status).toBe('ACTIVE')
  })

  it('should reject invalid status transition', async () => {
    // Mock sprint with COMPLETED status
    vi.mocked(prisma.sprint.findUnique).mockResolvedValue({
      id: 'sprint-123',
      name: 'Completed Sprint',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-15'),
      status: 'COMPLETED',
      squadId: 'squad-456',
      createdAt: new Date(),
      updatedAt: new Date(),
      squad: {
        scrumMasterId: 'user-789'
      }
    } as any)

    await expect(updateSprint('sprint-123', {
      name: 'Updated Sprint',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-01-29'),
      status: 'ACTIVE'
    }, 'user-789')).rejects.toThrow('Invalid status transition')
  })

  it('should reject unauthorized access', async () => {
    // Mock sprint owned by different user
    vi.mocked(prisma.sprint.findUnique).mockResolvedValue({
      id: 'sprint-123',
      name: 'Original Sprint',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-15'),
      status: 'INACTIVE',
      squadId: 'squad-456',
      createdAt: new Date(),
      updatedAt: new Date(),
      squad: {
        scrumMasterId: 'different-user'
      }
    } as any)

    await expect(updateSprint('sprint-123', {
      name: 'Updated Sprint',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-01-29')
    }, 'user-789')).rejects.toThrow('Unauthorized')
  })

  it('should handle sprint not found', async () => {
    vi.mocked(prisma.sprint.findUnique).mockResolvedValue(null)

    const result = await updateSprint('nonexistent-sprint', {
      name: 'Updated Sprint',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-01-29')
    }, 'user-789')

    expect(result).toBeNull()
  })
})