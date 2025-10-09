import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SquadCreationDrawer from '@/components/SquadCreationDrawer'

// make React available globally for JSX runtime in test environment
globalThis.React = React

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('SquadCreationDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Success' })
    })
  })

  describe('styling and responsive behavior', () => {
    it('should apply correct CSS classes to DrawerContent', () => {
      render(
        <SquadCreationDrawer
          open={true}
          onOpenChange={() => {}}
          onSquadCreated={() => {}}
        />
      )

      const drawerContent = screen.getByTestId('drawer-content')

      // Check that all required CSS classes are present
      expect(drawerContent).toHaveClass('max-h-[85vh]') // Existing height constraint
      expect(drawerContent).toHaveClass('lg:max-w-screen-md') // New width constraint for large screens
      expect(drawerContent).toHaveClass('lg:mx-auto')   // New centering for large screens
    })

    it('should have responsive width constraints', () => {
      render(
        <SquadCreationDrawer
          open={true}
          onOpenChange={() => {}}
          onSquadCreated={() => {}}
        />
      )

      const drawerContent = screen.getByTestId('drawer-content')
      const className = drawerContent.className

      // Verify the className contains the responsive classes
      expect(className).toContain('lg:max-w-screen-md')
      expect(className).toContain('lg:mx-auto')
      expect(className).toContain('max-h-[85vh]')
    })
  })

  describe('form elements and data-testid attributes', () => {
    it('should have correct data-testid attributes on form elements', () => {
      render(
        <SquadCreationDrawer
          open={true}
          onOpenChange={() => {}}
          onSquadCreated={() => {}}
        />
      )

      // Check that all required data-testid attributes are present
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument()
      expect(screen.getByTestId('squad-name-input')).toBeInTheDocument()
      expect(screen.getByTestId('squad-alias-input')).toBeInTheDocument()
      expect(screen.getByTestId('create-squad-submit')).toBeInTheDocument()
      expect(screen.getByTestId('cancel-squad-creation')).toBeInTheDocument()
    })

    it('should render form inputs with correct placeholders', () => {
      render(
        <SquadCreationDrawer
          open={true}
          onOpenChange={() => {}}
          onSquadCreated={() => {}}
        />
      )

      const nameInput = screen.getByTestId('squad-name-input')
      const aliasInput = screen.getByTestId('squad-alias-input')

      expect(nameInput).toHaveAttribute('placeholder', 'e.g., Alpha Team')
      expect(aliasInput).toHaveAttribute('placeholder', 'e.g., alpha-team')
    })
  })

  describe('form functionality', () => {
    it('should allow typing in form fields', async () => {
      render(
        <SquadCreationDrawer
          open={true}
          onOpenChange={() => {}}
          onSquadCreated={() => {}}
        />
      )

      const nameInput = screen.getByTestId('squad-name-input')
      const aliasInput = screen.getByTestId('squad-alias-input')

      fireEvent.change(nameInput, { target: { value: 'Test Squad' } })
      fireEvent.change(aliasInput, { target: { value: 'test-squad' } })

      expect(nameInput).toHaveValue('Test Squad')
      expect(aliasInput).toHaveValue('test-squad')
    })

    it('should submit form successfully', async () => {
      const mockOnSquadCreated = vi.fn()

      render(
        <SquadCreationDrawer
          open={true}
          onOpenChange={() => {}}
          onSquadCreated={mockOnSquadCreated}
        />
      )

      const nameInput = screen.getByTestId('squad-name-input')
      const aliasInput = screen.getByTestId('squad-alias-input')
      const submitButton = screen.getByTestId('create-squad-submit')

      fireEvent.change(nameInput, { target: { value: 'Test Squad' } })
      fireEvent.change(aliasInput, { target: { value: 'test-squad' } })
      fireEvent.click(submitButton)

      // Wait for the async operation to complete
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/squads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: 'Test Squad',
            alias: 'test-squad'
          })
        })
      })

      // Verify success callback was called
      expect(mockOnSquadCreated).toHaveBeenCalled()
    })
  })
})