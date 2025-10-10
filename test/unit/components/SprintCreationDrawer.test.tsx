import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { toast } from 'sonner'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

import SprintCreationDrawer from '@/components/SprintCreationDrawer'

describe('SprintCreationDrawer', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onSprintCreated: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ squads: [] })
    } as Response)
  })

  it('renders with correct title and form elements', () => {
    render(<SprintCreationDrawer {...defaultProps} />)

    expect(screen.getByText('Create New Sprint')).toBeInTheDocument()
    expect(screen.getByLabelText('Sprint Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Squad')).toBeInTheDocument()
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument()
    expect(screen.getByLabelText('End Date')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Sprint' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('fetches squads when drawer opens', async () => {
    const mockSquads = [
      { id: '1', name: 'Alpha Team', alias: 'alpha' },
      { id: '2', name: 'Beta Team', alias: 'beta' }
    ]

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ squads: mockSquads })
    } as Response)

    render(<SprintCreationDrawer {...defaultProps} />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/squads')
    })
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<SprintCreationDrawer {...defaultProps} />)

    const submitButton = screen.getByRole('button', { name: 'Create Sprint' })
    await user.click(submitButton)

    // Should show validation errors for required fields
    await waitFor(() => {
      expect(screen.getByText('Sprint name is required')).toBeInTheDocument()
      expect(screen.getByText('Please select a squad')).toBeInTheDocument()
    })
  })

  it('submits form successfully', async () => {
    const user = userEvent.setup()
    const mockOnSprintCreated = vi.fn()
    const mockOnOpenChange = vi.fn()

    const mockSquads = [{ id: '1', name: 'Alpha Team', alias: 'alpha' }]
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ squads: mockSquads })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprint: { id: '123' } })
      } as Response)

    render(
      <SprintCreationDrawer
        {...defaultProps}
        onSprintCreated={mockOnSprintCreated}
        onOpenChange={mockOnOpenChange}
      />
    )

    // Fill form
    await user.type(screen.getByLabelText('Sprint Name'), 'Test Sprint')
    
    // Select squad
    const squadSelect = screen.getByRole('combobox', { name: 'Squad' })
    await user.click(squadSelect)
    
    // Wait for squads to load and dropdown to open
    await waitFor(() => {
      expect(screen.getByText('Alpha Team (alpha)')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Alpha Team (alpha)'))

    // Submit (dates have default values)
    await user.click(screen.getByRole('button', { name: 'Create Sprint' }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/sprints', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Test Sprint')
      }))
      expect(mockOnSprintCreated).toHaveBeenCalled()
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()

    const mockSquads = [{ id: '1', name: 'Alpha Team', alias: 'alpha' }]
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ squads: mockSquads })
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Validation failed' })
      } as Response)

    render(<SprintCreationDrawer {...defaultProps} />)

    // Fill and submit form
    await user.type(screen.getByLabelText('Sprint Name'), 'Test Sprint')
    
    // Select squad
    const squadSelect = screen.getByRole('combobox', { name: 'Squad' })
    await user.click(squadSelect)
    
    // Wait for dropdown to open and squads to be visible
    await waitFor(() => {
      expect(screen.getByText('Alpha Team (alpha)')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Alpha Team (alpha)'))

    await user.click(screen.getByRole('button', { name: 'Create Sprint' }))

    await waitFor(() => {
      expect(vi.mocked(toast).error).toHaveBeenCalledWith('Validation failed')
    })
  })

  it('closes drawer when cancel is clicked', async () => {
    const user = userEvent.setup()
    const mockOnOpenChange = vi.fn()

    render(
      <SprintCreationDrawer
        {...defaultProps}
        onOpenChange={mockOnOpenChange}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })
})