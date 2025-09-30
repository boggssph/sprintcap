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
export function validateCreateSprintRequest(data: CreateSprintRequest): SprintValidationError[] {
  const errors: SprintValidationError[] = []

  // Validate name
  const name = typeof data.name === 'string' ? data.name : '';
  if (!name) {
    errors.push({ field: 'name', message: 'Name is required and must be a string' })
  } else if (name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name cannot be empty' })
  } else if (name.length > 100) {
    errors.push({ field: 'name', message: 'Name must be 100 characters or less' })
  }

  // Validate squadId
  const squadId = typeof data.squadId === 'string' ? data.squadId : '';
  if (!squadId) {
    errors.push({ field: 'squadId', message: 'Squad ID is required and must be a string' })
  }

  // Validate dates
  const startDateStr = typeof data.startDate === 'string' ? data.startDate : '';
  if (!startDateStr) {
    errors.push({ field: 'startDate', message: 'Start date is required and must be a string' })
  } else {
    const startDate = new Date(startDateStr);
    if (isNaN(startDate.getTime())) {
      errors.push({ field: 'startDate', message: 'Start date must be a valid ISO date string' })
    }
  }

  const endDateStr = typeof data.endDate === 'string' ? data.endDate : '';
  if (!endDateStr) {
    errors.push({ field: 'endDate', message: 'End date is required and must be a string' })
  } else {
    const endDate = new Date(endDateStr);
    if (isNaN(endDate.getTime())) {
      errors.push({ field: 'endDate', message: 'End date must be a valid ISO date string' })
    }
  }

  // Cross-field validation: end date must be after start date
  if (startDateStr && endDateStr) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      if (endDate <= startDate) {
        errors.push({ field: 'endDate', message: 'End date must be after start date' });
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

  // const now = new Date() // Unused variable removed

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
export function isCreateSprintRequest(data: Record<string, unknown>): boolean {
  const isValid = (
    typeof data === 'object' &&
    data !== null &&
    typeof data.name === 'string' &&
    typeof data.squadId === 'string' &&
    typeof data.startDate === 'string' &&
    typeof data.endDate === 'string'
  );
  if (!isValid) return false;
  // Cast to unknown first, then to CreateSprintRequest
  return validateCreateSprintRequest(data as unknown as CreateSprintRequest).length === 0;
}