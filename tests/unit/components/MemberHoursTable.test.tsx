import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import MemberHoursTable from '@/components/MemberHoursTable'

// Mock fetch
global.fetch = vi.fn()

describe('MemberHoursTable', () => {
  const mockSprintId = 'test-sprint'
  const mockMemberHours = [
    {
      id: '1',
      memberId: 'member1',
      sprintId: mockSprintId,
      memberName: 'John Doe',
      supportIncidents: 2.5,
      prReview: 1.0,
      others: 0.5,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    (global.fetch as any).mockImplementationOnce(() => new Promise(() => {})) // Never resolves

    render(<MemberHoursTable sprintId={mockSprintId} />)

    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument() // Loader
  })

  it('renders member hours table with data', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockMemberHours)
    })

    render(<MemberHoursTable sprintId={mockSprintId} />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    expect(screen.getByDisplayValue('2.5')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('0.5')).toBeInTheDocument()
  })

  it('handles input changes and saves on blur', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMemberHours)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockMemberHours[0], supportIncidents: 3.0 })
      })

    render(<MemberHoursTable sprintId={mockSprintId} />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('2.5')).toBeInTheDocument()
    })

    const input = screen.getByDisplayValue('2.5')
    fireEvent.change(input, { target: { value: '3.0' } })
    fireEvent.blur(input)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/member-hours', expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          memberId: 'member1',
          sprintId: mockSprintId,
          supportIncidents: 3.0,
          prReview: 1.0,
          others: 0.5
        })
      }))
    })
  })

  it('prevents negative values', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockMemberHours)
    })

    render(<MemberHoursTable sprintId={mockSprintId} />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('2.5')).toBeInTheDocument()
    })

    const input = screen.getByDisplayValue('2.5')
    fireEvent.change(input, { target: { value: '-1' } })
    fireEvent.blur(input)

    // Should not call API with negative value
    expect(global.fetch).toHaveBeenCalledTimes(1) // Only the initial fetch
    expect(screen.getByText('Hours cannot be negative')).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMemberHours)
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Save failed' })
      })

    render(<MemberHoursTable sprintId={mockSprintId} />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('2.5')).toBeInTheDocument()
    })

    const input = screen.getByDisplayValue('2.5')
    fireEvent.change(input, { target: { value: '3.0' } })
    fireEvent.blur(input)

    await waitFor(() => {
      expect(screen.getByText('Save failed')).toBeInTheDocument()
    })
  })
})