import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import SprintList from '@/components/SprintList'

describe('Sprint Cards Display Integration', () => {
  it('should display squad cards with sprint information', async () => {
    // This should fail until SprintList component is reimplemented as squad cards
    // The current SprintList renders a table, not squad cards
    render(<SprintList />)

    // This will fail because the current implementation doesn't have sprint cards
    expect(screen.getByTestId('sprint-card-sprint-1')).toBeInTheDocument()
  })

  it('should handle empty state when no sprints exist', async () => {
    // This should also fail because current implementation doesn't match expected behavior
    render(<SprintList />)

    expect(screen.getByText(/no sprints found/i)).toBeInTheDocument()
  })

  it('should group sprints by squad', async () => {
    // This should fail because current implementation doesn't have squad grouping
    render(<SprintList />)

    expect(screen.getByText('Alpha Team')).toBeInTheDocument()
  })
})