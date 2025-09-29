/**
 * Validation schemas and functions for Sprint entities
 */

export interface CreateSprintRequest {
  name: string
  squadId: string
  startDate: string
  endDate: string
}

export interface SprintValidationError {
  field: string
  message: string
}

/**
 * Validates a sprint creation request
 */
export function validateCreateSprintRequest(data: any): SprintValidationError[] {
  const errors: SprintValidationError[] = []

  // Validate name
  if (!data.name || typeof data.name !== 'string') {
    errors.push({ field: 'name', message: 'Name is required and must be a string' })
  } else if (data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name cannot be empty' })
  } else if (data.name.length > 100) {
    errors.push({ field: 'name', message: 'Name must be 100 characters or less' })
  }

  // Validate squadId
  if (!data.squadId || typeof data.squadId !== 'string') {
    errors.push({ field: 'squadId', message: 'Squad ID is required and must be a string' })
  }

  // Validate dates
  if (!data.startDate || typeof data.startDate !== 'string') {
    errors.push({ field: 'startDate', message: 'Start date is required and must be a string' })
  } else {
    const startDate = new Date(data.startDate)
    if (isNaN(startDate.getTime())) {
      errors.push({ field: 'startDate', message: 'Start date must be a valid ISO date string' })
    }
  }

  if (!data.endDate || typeof data.endDate !== 'string') {
    errors.push({ field: 'endDate', message: 'End date is required and must be a string' })
  } else {
    const endDate = new Date(data.endDate)
    if (isNaN(endDate.getTime())) {
      errors.push({ field: 'endDate', message: 'End date must be a valid ISO date string' })
    }
  }

  // Cross-field validation: end date must be after start date
  if (data.startDate && data.endDate) {
    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      if (endDate <= startDate) {
        errors.push({ field: 'endDate', message: 'End date must be after start date' })
      }
    }
  }

  return errors
}

/**
 * Validates sprint dates for business rules
 */
export function validateSprintDates(startDate: Date, endDate: Date): SprintValidationError[] {
  const errors: SprintValidationError[] = []

  const now = new Date()

  // Start date should be in the future or present (allow immediate starts)
  // Note: We allow past start dates for flexibility

  // End date must be after start date (already validated in basic validation)

  // Reasonable duration check (optional - allow flexibility)
  const durationMs = endDate.getTime() - startDate.getTime()
  const durationDays = durationMs / (1000 * 60 * 60 * 24)

  if (durationDays < 0) {
    errors.push({ field: 'duration', message: 'Sprint duration cannot be negative' })
  }

  // Allow very short sprints (even same-day) but warn about very long ones
  if (durationDays > 365) {
    // This is just a warning, not an error - allow flexibility
    console.warn(`Sprint duration of ${durationDays} days is unusually long`)
  }

  return errors
}

/**
 * Type guard to check if data is a valid CreateSprintRequest
 */
export function isCreateSprintRequest(data: any): data is CreateSprintRequest {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.name === 'string' &&
    typeof data.squadId === 'string' &&
    typeof data.startDate === 'string' &&
    typeof data.endDate === 'string' &&
    validateCreateSprintRequest(data).length === 0
  )
}