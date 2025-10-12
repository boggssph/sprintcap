import { describe, it, expect } from 'vitest'
import {
  validateStatusTransition,
  validateSprintDates,
  validateSprintUpdateRequest,
  type SprintUpdateRequest
} from '../../lib/validations/sprintUpdate'

describe('Sprint Validation Rules', () => {
  describe('Status Transition Validation', () => {
    it('should allow INACTIVE to ACTIVE transition', () => {
      const result = validateStatusTransition('INACTIVE', 'ACTIVE')
      expect(result).toBe(true)
    })

    it('should allow ACTIVE to COMPLETED transition', () => {
      const result = validateStatusTransition('ACTIVE', 'COMPLETED')
      expect(result).toBe(true)
    })

    it('should allow same status (no change)', () => {
      const result = validateStatusTransition('ACTIVE', 'ACTIVE')
      expect(result).toBe(true)
    })

    it('should reject COMPLETED sprint modifications', () => {
      const result = validateStatusTransition('COMPLETED', 'ACTIVE')
      expect(result).toBe(false)
    })

    it('should reject invalid transitions', () => {
      const result = validateStatusTransition('ACTIVE', 'INACTIVE')
      expect(result).toBe(false)
    })
  })

  describe('Date Validation', () => {
    it('should validate correct date order', () => {
      const startDate = new Date('2025-01-01')
      const endDate = new Date('2025-01-15')
      const result = validateSprintDates(startDate, endDate)
      expect(result).toBe(true)
    })

    it('should reject end date before start date', () => {
      const startDate = new Date('2025-01-15')
      const endDate = new Date('2025-01-01')
      const result = validateSprintDates(startDate, endDate)
      expect(result).toBe(false)
    })
  })
})