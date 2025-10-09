/**
 * Validation schemas and functions for Squad entities
 */

export interface CreateSquadRequest {
  name: string
  alias: string
}

export interface SquadValidationError {
  field: string
  message: string
}

/**
 * Validates a squad creation request
 */
export function validateCreateSquadRequest(data: unknown): SquadValidationError[] {
  const obj = (typeof data === 'object' && data !== null) ? data as Record<string, unknown> : {} as Record<string, unknown>;
  const errors: SquadValidationError[] = []

  // Validate name
  const name = typeof obj.name === 'string' ? obj.name.trim() : '';
  if (!name) {
    errors.push({ field: 'name', message: 'Name is required and must be a string' })
  } else if (name.length === 0) {
    errors.push({ field: 'name', message: 'Name cannot be empty' })
  } else if (name.length > 100) {
    errors.push({ field: 'name', message: 'Name must be 100 characters or less' })
  }

  // Validate alias
  const alias = typeof obj.alias === 'string' ? obj.alias.trim() : '';
  if (!alias) {
    errors.push({ field: 'alias', message: 'Alias is required and must be a string' })
  } else if (alias.length === 0) {
    errors.push({ field: 'alias', message: 'Alias cannot be empty' })
  } else if (alias.length > 50) {
    errors.push({ field: 'alias', message: 'Alias must be 50 characters or less' })
  } else if (!/^[a-z0-9-]+$/.test(alias)) {
    errors.push({ field: 'alias', message: 'Alias must contain only lowercase letters, numbers, and hyphens' })
  }

  return errors
}