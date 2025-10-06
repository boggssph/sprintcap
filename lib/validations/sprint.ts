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
export function validateCreateSprintRequest(data: unknown): SprintValidationError[] {
  const obj = (typeof data === 'object' && data !== null) ? data as Record<string, unknown> : {} as Record<string, unknown>;
  const errors: SprintValidationError[] = []

  // Validate name
  const name = typeof obj.name === 'string' ? obj.name : '';
  if (!name) {
    errors.push({ field: 'name', message: 'Name is required and must be a string' })
  } else if (name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name cannot be empty' })
  } else if (name.length > 100) {
    errors.push({ field: 'name', message: 'Name must be 100 characters or less' })
  }

  // Validate squadId
  const squadId = typeof obj.squadId === 'string' ? obj.squadId : '';
  if (!squadId) {
    errors.push({ field: 'squadId', message: 'Squad ID is required and must be a string' })
  }

  // Validate dates
  const startDateStr = typeof obj.startDate === 'string' ? obj.startDate : '';
  if (!startDateStr) {
    errors.push({ field: 'startDate', message: 'Start date is required and must be a string' })
  } else {
    const startDate = new Date(startDateStr);
    if (isNaN(startDate.getTime())) {
      errors.push({ field: 'startDate', message: 'Start date must be a valid ISO date string' })
    }
  }

  const endDateStr = typeof obj.endDate === 'string' ? obj.endDate : '';
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
export function isCreateSprintRequest(data: unknown): boolean {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  const isValid = (
    typeof d.name === 'string' &&
    typeof d.squadId === 'string' &&
    typeof d.startDate === 'string' &&
    typeof d.endDate === 'string'
  );
  if (!isValid) return false;
  // Now call validateCreateSprintRequest with the raw object
  return validateCreateSprintRequest(d).length === 0;
}