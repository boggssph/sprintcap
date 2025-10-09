import { describe, it, expect } from 'vitest'
import { getInitials } from '@/lib/avatar-utils'

describe('getInitials', () => {
  describe('with full names', () => {
    it('should return first letter of first name + first letter of last name', () => {
      expect(getInitials('John Doe')).toBe('JD')
      expect(getInitials('Jane Smith')).toBe('JS')
      expect(getInitials('Alice Johnson')).toBe('AJ')
    })

    it('should handle names with multiple middle names', () => {
      expect(getInitials('John Michael Doe')).toBe('JD')
      expect(getInitials('Mary Jane Watson Parker')).toBe('MP')
    })

    it('should handle names with extra whitespace', () => {
      expect(getInitials('  John   Doe  ')).toBe('JD')
      expect(getInitials('John\tDoe')).toBe('JD')
    })
  })

  describe('with single names', () => {
    it('should return first two letters for names longer than 2 characters', () => {
      expect(getInitials('John')).toBe('JO')
      expect(getInitials('Alice')).toBe('AL')
      expect(getInitials('Christopher')).toBe('CH')
    })

    it('should return single letter for names with 1 character', () => {
      expect(getInitials('A')).toBe('A')
      expect(getInitials('Z')).toBe('Z')
    })

    it('should return first two letters for names with exactly 2 characters', () => {
      expect(getInitials('Jo')).toBe('JO')
      expect(getInitials('Al')).toBe('AL')
    })
  })

  describe('with email fallback', () => {
    it('should use email username when no name provided', () => {
      expect(getInitials(null, 'john.doe@example.com')).toBe('JO')
      expect(getInitials(undefined, 'alice@example.com')).toBe('AL')
      expect(getInitials('', 'test@example.com')).toBe('TE')
    })

    it('should handle email usernames with special characters', () => {
      expect(getInitials(null, 'john.doe+tag@example.com')).toBe('JO')
      expect(getInitials(null, 'user-name@example.com')).toBe('US')
    })

    it('should handle single character email usernames', () => {
      expect(getInitials(null, 'a@example.com')).toBe('A')
      expect(getInitials(null, 'x@example.com')).toBe('X')
    })
  })

  describe('edge cases', () => {
    it('should handle empty or null inputs', () => {
      expect(getInitials(null, null)).toBe('U')
      expect(getInitials('', '')).toBe('U')
      expect(getInitials(undefined, undefined)).toBe('U')
    })

    it('should handle names with only whitespace', () => {
      expect(getInitials('   ', 'test@example.com')).toBe('TE')
      expect(getInitials('\t\n', null)).toBe('U')
    })

    it('should handle special characters in names', () => {
      expect(getInitials('José María')).toBe('JM')
      expect(getInitials('O\'Connor')).toBe('OC')
      expect(getInitials('Jean-Pierre')).toBe('JP')
    })

    it('should handle very long names', () => {
      const longName = 'A'.repeat(100)
      expect(getInitials(longName)).toBe('AA')
    })
  })

  describe('case handling', () => {
    it('should convert to uppercase', () => {
      expect(getInitials('john doe')).toBe('JD')
      expect(getInitials('JANE SMITH')).toBe('JS')
      expect(getInitials('mIxEd CaSe')).toBe('MC')
    })

    it('should handle mixed case emails', () => {
      expect(getInitials(null, 'John.Doe@Example.Com')).toBe('JO')
    })
  })
})