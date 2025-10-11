/**
 * Validation schemas and functions for Ticket entities
 */

import { WorkType, ParentType, PlannedUnplanned } from '@/lib/types/ticket'

export interface TicketValidationError {
  field: string
  message: string
}

/**
 * Validates a ticket creation request
 */
export function validateCreateTicketRequest(data: unknown): TicketValidationError[] {
  const obj = (typeof data === 'object' && data !== null) ? data as Record<string, unknown> : {} as Record<string, unknown>
  const errors: TicketValidationError[] = []

  // Validate jiraId
  const jiraId = typeof obj.jiraId === 'string' ? obj.jiraId.trim() : ''
  if (!jiraId) {
    errors.push({ field: 'jiraId', message: 'Jira ID is required and must be a string' })
  } else if (jiraId.length === 0) {
    errors.push({ field: 'jiraId', message: 'Jira ID cannot be empty' })
  } else if (jiraId.length > 100) {
    errors.push({ field: 'jiraId', message: 'Jira ID must be 100 characters or less' })
  }

  // Validate hours
  const hours = typeof obj.hours === 'number' ? obj.hours : NaN
  if (isNaN(hours)) {
    errors.push({ field: 'hours', message: 'Hours is required and must be a number' })
  } else if (hours < 0) {
    errors.push({ field: 'hours', message: 'Hours must be 0 or greater' })
  } else if (hours > 9999) {
    errors.push({ field: 'hours', message: 'Hours must be 9999 or less' })
  }

  // Validate workType
  const workType = obj.workType
  const validWorkTypes = Object.values(WorkType)
  if (!workType) {
    errors.push({ field: 'workType', message: 'Work type is required' })
  } else if (!validWorkTypes.includes(workType as WorkType)) {
    errors.push({ field: 'workType', message: `Work type must be one of: ${validWorkTypes.join(', ')}` })
  }

  // Validate parentType
  const parentType = obj.parentType
  const validParentTypes = Object.values(ParentType)
  if (!parentType) {
    errors.push({ field: 'parentType', message: 'Parent type is required' })
  } else if (!validParentTypes.includes(parentType as ParentType)) {
    errors.push({ field: 'parentType', message: `Parent type must be one of: ${validParentTypes.join(', ')}` })
  }

  // Validate plannedUnplanned
  const plannedUnplanned = obj.plannedUnplanned
  const validPlannedUnplanned = Object.values(PlannedUnplanned)
  if (!plannedUnplanned) {
    errors.push({ field: 'plannedUnplanned', message: 'Planned/Unplanned is required' })
  } else if (!validPlannedUnplanned.includes(plannedUnplanned as PlannedUnplanned)) {
    errors.push({ field: 'plannedUnplanned', message: `Planned/Unplanned must be one of: ${validPlannedUnplanned.join(', ')}` })
  }

  // Validate memberId (optional)
  const memberId = obj.memberId
  if (memberId !== undefined && memberId !== null) {
    if (typeof memberId !== 'string') {
      errors.push({ field: 'memberId', message: 'Member ID must be a string or null' })
    } else if (memberId.length === 0) {
      errors.push({ field: 'memberId', message: 'Member ID cannot be an empty string' })
    }
  }

  return errors
}

/**
 * Validates a ticket update request
 */
export function validateUpdateTicketRequest(data: unknown): TicketValidationError[] {
  const obj = (typeof data === 'object' && data !== null) ? data as Record<string, unknown> : {} as Record<string, unknown>
  const errors: TicketValidationError[] = []

  // Validate jiraId (optional in updates)
  if (obj.jiraId !== undefined) {
    const jiraId = typeof obj.jiraId === 'string' ? obj.jiraId.trim() : ''
    if (jiraId.length === 0) {
      errors.push({ field: 'jiraId', message: 'Jira ID cannot be empty' })
    } else if (jiraId.length > 100) {
      errors.push({ field: 'jiraId', message: 'Jira ID must be 100 characters or less' })
    }
  }

  // Validate hours (optional in updates)
  if (obj.hours !== undefined) {
    const hours = typeof obj.hours === 'number' ? obj.hours : NaN
    if (isNaN(hours)) {
      errors.push({ field: 'hours', message: 'Hours must be a number' })
    } else if (hours < 0) {
      errors.push({ field: 'hours', message: 'Hours must be 0 or greater' })
    } else if (hours > 9999) {
      errors.push({ field: 'hours', message: 'Hours must be 9999 or less' })
    }
  }

  // Validate workType (optional in updates)
  if (obj.workType !== undefined) {
    const workType = obj.workType
    const validWorkTypes = Object.values(WorkType)
    if (!validWorkTypes.includes(workType as WorkType)) {
      errors.push({ field: 'workType', message: `Work type must be one of: ${validWorkTypes.join(', ')}` })
    }
  }

  // Validate parentType (optional in updates)
  if (obj.parentType !== undefined) {
    const parentType = obj.parentType
    const validParentTypes = Object.values(ParentType)
    if (!validParentTypes.includes(parentType as ParentType)) {
      errors.push({ field: 'parentType', message: `Parent type must be one of: ${validParentTypes.join(', ')}` })
    }
  }

  // Validate plannedUnplanned (optional in updates)
  if (obj.plannedUnplanned !== undefined) {
    const plannedUnplanned = obj.plannedUnplanned
    const validPlannedUnplanned = Object.values(PlannedUnplanned)
    if (!validPlannedUnplanned.includes(plannedUnplanned as PlannedUnplanned)) {
      errors.push({ field: 'plannedUnplanned', message: `Planned/Unplanned must be one of: ${validPlannedUnplanned.join(', ')}` })
    }
  }

  // Validate memberId (optional in updates)
  if (obj.memberId !== undefined) {
    const memberId = obj.memberId
    if (memberId !== null) {
      if (typeof memberId !== 'string') {
        errors.push({ field: 'memberId', message: 'Member ID must be a string or null' })
      } else if (memberId.length === 0) {
        errors.push({ field: 'memberId', message: 'Member ID cannot be an empty string' })
      }
    }
  }

  return errors
}