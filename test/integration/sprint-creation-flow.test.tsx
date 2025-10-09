import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import SprintCreationForm from '@/components/SprintCreationForm'

describe('Sprint Creation Flow Integration', () => {
  it('should render sprint creation form with squad selection', () => {
    // This should fail until the form is properly integrated
    const mockSquads = [
      { id: 'squad-1', name: 'Alpha Team', alias: 'alpha', memberCount: 5 }
    ]

    render(<SprintCreationForm squadsProp={mockSquads} />)

    // Should show form elements
    expect(screen.getByText(/create new sprint/i)).toBeInTheDocument()
  })

  it('should validate form inputs', () => {
    // This should fail until form validation is implemented
    const mockSquads = [
      { id: 'squad-1', name: 'Alpha Team', alias: 'alpha', memberCount: 5 }
    ]

    render(<SprintCreationForm squadsProp={mockSquads} />)

    // Should show validation errors for empty form
    expect(screen.getByText(/name is required/i)).toBeInTheDocument()
  })

  it('should submit form and create sprint', () => {
    // This should fail until form submission is implemented
    const mockSquads = [
      { id: 'squad-1', name: 'Alpha Team', alias: 'alpha', memberCount: 5 }
    ]

    render(<SprintCreationForm squadsProp={mockSquads} />)

    // Fill form and submit - should succeed
    expect(screen.getByText(/sprint created successfully/i)).toBeInTheDocument()
  })
})