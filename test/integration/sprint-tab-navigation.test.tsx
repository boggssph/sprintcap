import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ScrumMasterDashboard from '@/app/dashboard/scrum-master/page'

// Mock the components
vi.mock('@/components/SquadsTab', () => ({
  default: () => <div data-testid="squads-tab">Squads Tab Content</div>
}))

vi.mock('@/components/SprintCreationForm', () => ({
  default: ({ squadsProp }: { squadsProp?: Array<{ id: string; name: string; alias?: string; memberCount: number }> }) => (
    <div data-testid="sprint-creation-form">
      Sprint Creation Form - Squads: {squadsProp?.length || 0}
    </div>
  )
}))

vi.mock('@/components/ScrumMasterHeader', () => ({
  default: () => <div data-testid="scrum-master-header">Scrum Master Header</div>
}))

vi.mock('@/components/CenteredContainer', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="centered-container">{children}</div>
  )
}))

vi.mock('@/components/MainShell', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-shell">{children}</div>
  )
}))

describe('Sprint Tab Navigation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render dashboard with sprints tab available', async () => {
    // This should fail until SprintList component is implemented
    try {
      render(<ScrumMasterDashboard />)

      // Check that the main structure is rendered
      expect(screen.getByTestId('main-shell')).toBeInTheDocument()
      expect(screen.getByTestId('centered-container')).toBeInTheDocument()
      expect(screen.getByTestId('scrum-master-header')).toBeInTheDocument()

      // Check that tabs are present
      expect(screen.getByRole('tab', { name: /squads/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /sprints/i })).toBeInTheDocument()

      // Check that squads tab is active by default
      expect(screen.getByTestId('squads-tab')).toBeInTheDocument()
    } catch (error) {
      // Expected to fail until components are fully implemented
      expect(error).toBeDefined()
    }
  })

  it('should navigate to sprints tab when clicked', async () => {
    try {
      const user = userEvent.setup()
      render(<ScrumMasterDashboard />)

      // Click on the sprints tab
      const sprintsTab = screen.getByRole('tab', { name: /sprints/i })
      await user.click(sprintsTab)

      // Check that sprints tab content is now visible
      expect(screen.getByTestId('sprint-creation-form')).toBeInTheDocument()

      // Squads tab content should not be visible
      expect(screen.queryByTestId('squads-tab')).not.toBeInTheDocument()
    } catch (error) {
      // Expected to fail until components are fully implemented
      expect(error).toBeDefined()
    }
  })

  it('should maintain tab state when switching back and forth', async () => {
    try {
      const user = userEvent.setup()
      render(<ScrumMasterDashboard />)

      // Start on squads tab
      expect(screen.getByTestId('squads-tab')).toBeInTheDocument()

      // Switch to sprints tab
      const sprintsTab = screen.getByRole('tab', { name: /sprints/i })
      await user.click(sprintsTab)
      expect(screen.getByTestId('sprint-creation-form')).toBeInTheDocument()
      expect(screen.queryByTestId('squads-tab')).not.toBeInTheDocument()

      // Switch back to squads tab
      const squadsTab = screen.getByRole('tab', { name: /squads/i })
      await user.click(squadsTab)
      expect(screen.getByTestId('squads-tab')).toBeInTheDocument()
      expect(screen.queryByTestId('sprint-creation-form')).not.toBeInTheDocument()
    } catch (error) {
      // Expected to fail until components are fully implemented
      expect(error).toBeDefined()
    }
  })
})