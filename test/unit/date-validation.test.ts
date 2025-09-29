import { describe, it, expect, vi } from 'vitest'
import { validateCreateSprintRequest, validateSprintDates, isCreateSprintRequest } from '../../lib/validations/sprint'

describe('Sprint Date Validation', () => {
  describe('validateCreateSprintRequest', () => {
    it('should validate a valid sprint creation request', () => {
      const validRequest = {
        name: 'Sprint 2025.10',
        squadId: 'squad-123',
        startDate: '2025-10-01T09:00:00Z',
        endDate: '2025-10-15T17:00:00Z'
      }

      const errors = validateCreateSprintRequest(validRequest)
      expect(errors).toHaveLength(0)
    })

    it('should reject missing name', () => {
      const request = {
        squadId: 'squad-123',
        startDate: '2025-10-01T09:00:00Z',
        endDate: '2025-10-15T17:00:00Z'
      }

      const errors = validateCreateSprintRequest(request)
      expect(errors).toContainEqual({
        field: 'name',
        message: 'Name is required and must be a string'
      })
    })

    it('should reject empty name', () => {
      const request = {
        name: '',
        squadId: 'squad-123',
        startDate: '2025-10-01T09:00:00Z',
        endDate: '2025-10-15T17:00:00Z'
      }

      const errors = validateCreateSprintRequest(request)
      expect(errors).toContainEqual({
        field: 'name',
        message: 'Name is required and must be a string'
      })
    })

    it('should reject name longer than 100 characters', () => {
      const longName = 'a'.repeat(101)
      const request = {
        name: longName,
        squadId: 'squad-123',
        startDate: '2025-10-01T09:00:00Z',
        endDate: '2025-10-15T17:00:00Z'
      }

      const errors = validateCreateSprintRequest(request)
      expect(errors).toContainEqual({
        field: 'name',
        message: 'Name must be 100 characters or less'
      })
    })

    it('should reject missing squadId', () => {
      const request = {
        name: 'Sprint 2025.10',
        startDate: '2025-10-01T09:00:00Z',
        endDate: '2025-10-15T17:00:00Z'
      }

      const errors = validateCreateSprintRequest(request)
      expect(errors).toContainEqual({
        field: 'squadId',
        message: 'Squad ID is required and must be a string'
      })
    })

    it('should reject missing startDate', () => {
      const request = {
        name: 'Sprint 2025.10',
        squadId: 'squad-123',
        endDate: '2025-10-15T17:00:00Z'
      }

      const errors = validateCreateSprintRequest(request)
      expect(errors).toContainEqual({
        field: 'startDate',
        message: 'Start date is required and must be a string'
      })
    })

    it('should reject invalid startDate format', () => {
      const request = {
        name: 'Sprint 2025.10',
        squadId: 'squad-123',
        startDate: 'invalid-date',
        endDate: '2025-10-15T17:00:00Z'
      }

      const errors = validateCreateSprintRequest(request)
      expect(errors).toContainEqual({
        field: 'startDate',
        message: 'Start date must be a valid ISO date string'
      })
    })

    it('should reject missing endDate', () => {
      const request = {
        name: 'Sprint 2025.10',
        squadId: 'squad-123',
        startDate: '2025-10-01T09:00:00Z'
      }

      const errors = validateCreateSprintRequest(request)
      expect(errors).toContainEqual({
        field: 'endDate',
        message: 'End date is required and must be a string'
      })
    })

    it('should reject invalid endDate format', () => {
      const request = {
        name: 'Sprint 2025.10',
        squadId: 'squad-123',
        startDate: '2025-10-01T09:00:00Z',
        endDate: 'not-a-date'
      }

      const errors = validateCreateSprintRequest(request)
      expect(errors).toContainEqual({
        field: 'endDate',
        message: 'End date must be a valid ISO date string'
      })
    })

    it('should reject end date before start date', () => {
      const request = {
        name: 'Sprint 2025.10',
        squadId: 'squad-123',
        startDate: '2025-10-15T17:00:00Z',
        endDate: '2025-10-01T09:00:00Z'
      }

      const errors = validateCreateSprintRequest(request)
      expect(errors).toContainEqual({
        field: 'endDate',
        message: 'End date must be after start date'
      })
    })

    it('should reject same start and end date/time', () => {
      const request = {
        name: 'Sprint 2025.10',
        squadId: 'squad-123',
        startDate: '2025-10-01T09:00:00Z',
        endDate: '2025-10-01T09:00:00Z'
      }

      const errors = validateCreateSprintRequest(request)
      expect(errors).toContainEqual({
        field: 'endDate',
        message: 'End date must be after start date'
      })
    })

    it('should accept valid same-day sprint with different times', () => {
      const request = {
        name: 'Sprint 2025.10',
        squadId: 'squad-123',
        startDate: '2025-10-01T09:00:00Z',
        endDate: '2025-10-01T17:00:00Z'
      }

      const errors = validateCreateSprintRequest(request)
      expect(errors).toHaveLength(0)
    })

    it('should handle multiple validation errors', () => {
      const request = {
        name: '',
        squadId: '',
        startDate: 'invalid',
        endDate: 'also-invalid'
      }

      const errors = validateCreateSprintRequest(request)
      expect(errors.length).toBeGreaterThan(1)
      expect(errors.some(e => e.field === 'name')).toBe(true)
      expect(errors.some(e => e.field === 'squadId')).toBe(true)
      expect(errors.some(e => e.field === 'startDate')).toBe(true)
      expect(errors.some(e => e.field === 'endDate')).toBe(true)
    })
  })

  describe('validateSprintDates', () => {
    it('should accept valid sprint dates', () => {
      const startDate = new Date('2025-10-01T09:00:00Z')
      const endDate = new Date('2025-10-15T17:00:00Z')

      const errors = validateSprintDates(startDate, endDate)
      expect(errors).toHaveLength(0)
    })

    it('should accept same-day sprints', () => {
      const startDate = new Date('2025-10-01T09:00:00Z')
      const endDate = new Date('2025-10-01T17:00:00Z')

      const errors = validateSprintDates(startDate, endDate)
      expect(errors).toHaveLength(0)
    })

    it('should reject negative duration', () => {
      const startDate = new Date('2025-10-15T17:00:00Z')
      const endDate = new Date('2025-10-01T09:00:00Z')

      const errors = validateSprintDates(startDate, endDate)
      expect(errors).toContainEqual({
        field: 'duration',
        message: 'Sprint duration cannot be negative'
      })
    })

    it('should allow very long sprints (just logs warning)', () => {
      const startDate = new Date('2025-10-01T09:00:00Z')
      const endDate = new Date('2026-10-01T17:00:00Z') // 366 days

      // Mock console.warn to capture the warning
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const errors = validateSprintDates(startDate, endDate)
      expect(errors).toHaveLength(0)
      expect(consoleWarnSpy).toHaveBeenCalledWith('Sprint duration of 365.3333333333333 days is unusually long')

      consoleWarnSpy.mockRestore()
    })
  })

  describe('isCreateSprintRequest', () => {
    it('should return true for valid request', () => {
      const validRequest = {
        name: 'Sprint 2025.10',
        squadId: 'squad-123',
        startDate: '2025-10-01T09:00:00Z',
        endDate: '2025-10-15T17:00:00Z'
      }

      expect(isCreateSprintRequest(validRequest)).toBe(true)
    })

    it('should return false for invalid request', () => {
      const invalidRequest = {
        name: '',
        squadId: 'squad-123',
        startDate: '2025-10-01T09:00:00Z',
        endDate: '2025-10-15T17:00:00Z'
      }

      expect(isCreateSprintRequest(invalidRequest)).toBe(false)
    })

    it('should return false for non-objects', () => {
      expect(isCreateSprintRequest(null)).toBe(false)
      expect(isCreateSprintRequest('string')).toBe(false)
      expect(isCreateSprintRequest(123)).toBe(false)
      expect(isCreateSprintRequest([])).toBe(false)
    })
  })
})