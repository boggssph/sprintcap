import { z } from 'zod'

// Sprint status enum matching Prisma schema
export const SprintStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'COMPLETED'])
export type SprintStatus = z.infer<typeof SprintStatusEnum>

// Sprint update request schema
export const SprintUpdateRequestSchema = z.object({
  name: z.string().min(1, 'Sprint name is required').max(100, 'Sprint name too long'),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date'),
  status: SprintStatusEnum.optional(),
}).refine((data) => {
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)
  return start < end
}, {
  message: 'Start date must be before end date',
  path: ['endDate']
})

export type SprintUpdateRequest = z.infer<typeof SprintUpdateRequestSchema>

// Validation functions
export function validateSprintUpdateRequest(data: unknown): SprintUpdateRequest {
  return SprintUpdateRequestSchema.parse(data)
}

export function validateSprintDates(startDate: Date, endDate: Date): boolean {
  return startDate < endDate
}

export function validateStatusTransition(currentStatus: SprintStatus, newStatus: SprintStatus): boolean {
  // Allow same status (no change)
  if (currentStatus === newStatus) {
    return true
  }

  // Define valid transitions
  const validTransitions: Record<SprintStatus, SprintStatus[]> = {
    'INACTIVE': ['ACTIVE'], // Can only activate inactive sprints
    'ACTIVE': ['COMPLETED'], // Can only complete active sprints
    'COMPLETED': [] // Completed sprints cannot be changed
  }

  return validTransitions[currentStatus]?.includes(newStatus) ?? false
}