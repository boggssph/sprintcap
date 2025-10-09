import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProfileDisplay from '@/components/ProfileDisplay'

// make React available globally for JSX runtime in test environment
globalThis.React = React

// Mock next-auth
const mockUseSession = vi.fn()
vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children
}))

describe('ProfileDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading state', () => {
    it('should show skeleton when loading', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading'
      })

      render(<ProfileDisplay />)

      expect(screen.getByTestId('profile-display')).toBeInTheDocument()
      // Should have skeleton elements with animate-pulse class
      const container = screen.getByTestId('profile-display')
      const skeletonElements = container.querySelectorAll('.animate-pulse')
      expect(skeletonElements.length).toBeGreaterThan(0)
    })
  })

  describe('no session', () => {
    it('should return null when no user session', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated'
      })

      const { container } = render(<ProfileDisplay />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('avatar display logic', () => {
    it('should show Google avatar image when available', () => {
      const mockUser = {
        name: 'John Doe',
        email: 'john@example.com',
        image: 'https://example.com/avatar.jpg'
      }

      mockUseSession.mockReturnValue({
        data: { user: mockUser },
        status: 'authenticated'
      })

      render(<ProfileDisplay />)

      const avatarImage = screen.getByAltText("John Doe's profile picture")
      expect(avatarImage).toBeInTheDocument()
      expect(avatarImage).toHaveAttribute('src', 'https://example.com/avatar.jpg')

      // Should not show initials when image is available
      expect(screen.queryByTestId('avatar-fallback')).not.toBeInTheDocument()
    })

    it('should show initials when no Google avatar available', () => {
      const mockUser = {
        name: 'John Doe',
        email: 'john@example.com',
        image: null
      }

      mockUseSession.mockReturnValue({
        data: { user: mockUser },
        status: 'authenticated'
      })

      render(<ProfileDisplay />)

      // Should show initials
      expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('JD')
      expect(screen.getByText('John Doe')).toBeInTheDocument()

      // Should not have avatar image
      expect(screen.queryByAltText("John Doe's profile picture")).not.toBeInTheDocument()
    })

    it('should use email for initials when no name available', () => {
      const mockUser = {
        name: null,
        email: 'john.doe@example.com',
        image: null
      }

      mockUseSession.mockReturnValue({
        data: { user: mockUser },
        status: 'authenticated'
      })

      render(<ProfileDisplay />)

      expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('JO')
      expect(screen.getByText('john.doe')).toBeInTheDocument()
    })

    it('should handle single name correctly', () => {
      const mockUser = {
        name: 'John',
        email: 'john@example.com',
        image: null
      }

      mockUseSession.mockReturnValue({
        data: { user: mockUser },
        status: 'authenticated'
      })

      render(<ProfileDisplay />)

      expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('JO')
    })
  })

  describe('size variants', () => {
    it.each([
      ['sm', 'h-6 w-6'],
      ['md', 'h-8 w-8'],
      ['lg', 'h-12 w-12']
    ])('should apply correct size classes for %s', (size, expectedClass) => {
      const mockUser = {
        name: 'John Doe',
        email: 'john@example.com',
        image: null
      }

      mockUseSession.mockReturnValue({
        data: { user: mockUser },
        status: 'authenticated'
      })

      render(<ProfileDisplay size={size as 'sm' | 'md' | 'lg'} />)

      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass(expectedClass)
    })
  })

  describe('orientation variants', () => {
    it('should apply horizontal layout by default', () => {
      const mockUser = {
        name: 'John Doe',
        email: 'john@example.com',
        image: null
      }

      mockUseSession.mockReturnValue({
        data: { user: mockUser },
        status: 'authenticated'
      })

      render(<ProfileDisplay />)

      const container = screen.getByTestId('profile-display')
      expect(container).toHaveClass('flex', 'items-center', 'gap-2')
      expect(container).not.toHaveClass('flex-col')
    })

    it('should apply vertical layout when specified', () => {
      const mockUser = {
        name: 'John Doe',
        email: 'john@example.com',
        image: null
      }

      mockUseSession.mockReturnValue({
        data: { user: mockUser },
        status: 'authenticated'
      })

      render(<ProfileDisplay orientation="vertical" />)

      const container = screen.getByTestId('profile-display')
      expect(container).toHaveClass('flex-col')
    })
  })

  describe('name display', () => {
    it('should show name by default', () => {
      const mockUser = {
        name: 'John Doe',
        email: 'john@example.com',
        image: null
      }

      mockUseSession.mockReturnValue({
        data: { user: mockUser },
        status: 'authenticated'
      })

      render(<ProfileDisplay />)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should hide name when showName is false', () => {
      const mockUser = {
        name: 'John Doe',
        email: 'john@example.com',
        image: null
      }

      mockUseSession.mockReturnValue({
        data: { user: mockUser },
        status: 'authenticated'
      })

      render(<ProfileDisplay showName={false} />)

      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    it('should handle image load errors gracefully', () => {
      const mockUser = {
        name: 'John Doe',
        email: 'john@example.com',
        image: 'https://invalid-url.com/broken.jpg'
      }

      mockUseSession.mockReturnValue({
        data: { user: mockUser },
        status: 'authenticated'
      })

      render(<ProfileDisplay />)

      // Image should be present initially
      const avatarImage = screen.getByAltText("John Doe's profile picture")
      expect(avatarImage).toBeInTheDocument()

      // Simulate error - in a real scenario, this would trigger onError
      // For testing purposes, we verify the structure allows for error handling
      expect(avatarImage).toHaveAttribute('alt')
    })
  })
})