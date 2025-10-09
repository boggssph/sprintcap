import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import SprintList from '@/components/SprintList'

describe('Sprint Empty State Handling Integration', () => {
  it('should show empty state when no sprints exist', () => {
    // This should fail until empty state is properly implemented
    render(<SprintList />)

    // Current implementation shows "No sprints created yet."
    // But we want it to show squad cards with empty states
    expect(screen.getByText(/no squads found/i)).toBeInTheDocument()
  })

  it('should show create squad CTA in empty state', () => {
    // This should fail until CTA is implemented
    render(<SprintList />)

    expect(screen.getByText(/create your first squad/i)).toBeInTheDocument()
  })
})