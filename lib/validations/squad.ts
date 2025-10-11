/**
 * Validation schemas and functions for Squad entities
 */

export interface CreateSquadRequest {
  name: string
  alias: string
}

export interface UpdateSquadRequest {
  name?: string
  alias?: string
  dailyScrumMinutes?: number
  refinementHours?: number
  reviewDemoMinutes?: number
  planningHours?: number
  retrospectiveMinutes?: number
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

/**
 * Validates a squad update request
 */
export function validateUpdateSquadRequest(data: unknown): SquadValidationError[] {
  const obj = (typeof data === 'object' && data !== null) ? data as Record<string, unknown> : {} as Record<string, unknown>;
  const errors: SquadValidationError[] = []

  // Validate name (optional)
  if ('name' in obj) {
    const name = typeof obj.name === 'string' ? obj.name.trim() : '';
    if (name.length === 0) {
      errors.push({ field: 'name', message: 'Name cannot be empty' })
    } else if (name.length > 100) {
      errors.push({ field: 'name', message: 'Name must be 100 characters or less' })
    }
  }

  // Validate alias (optional)
  if ('alias' in obj) {
    const alias = typeof obj.alias === 'string' ? obj.alias.trim() : '';
    if (alias.length === 0) {
      errors.push({ field: 'alias', message: 'Alias cannot be empty' })
    } else if (alias.length > 50) {
      errors.push({ field: 'alias', message: 'Alias must be 50 characters or less' })
    } else if (!/^[a-z0-9-]+$/.test(alias)) {
      errors.push({ field: 'alias', message: 'Alias must contain only lowercase letters, numbers, and hyphens' })
    }
  }

  // Validate ceremony time fields (all optional positive numbers)
  const timeFields = [
    { key: 'dailyScrumMinutes', type: 'integer' },
    { key: 'reviewDemoMinutes', type: 'integer' },
    { key: 'retrospectiveMinutes', type: 'integer' },
    { key: 'refinementHours', type: 'float' },
    { key: 'planningHours', type: 'float' }
  ];

  for (const field of timeFields) {
    if (field.key in obj) {
      const value = obj[field.key];
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push({ field: field.key, message: `${field.key} must be a number` });
      } else if (value <= 0) {
        errors.push({ field: field.key, message: `${field.key} must be greater than 0` });
      } else if (field.type === 'integer' && !Number.isInteger(value)) {
        errors.push({ field: field.key, message: `${field.key} must be a whole number` });
      }
    }
  }

  return errors
}