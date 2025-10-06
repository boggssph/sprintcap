import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ScrumMasterDashboard from '@/app/dashboard/scrum-master/page'

// make React available globally for JSX runtime in test environment
;(globalThis as unknown as { React?: typeof React }).React = React

vi.mock('next-auth/react', () => ({ useSession: () => ({ data: { user: { email: 'test@example.com' } } }) }))

describe('Sidebar submenu focus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ squads: [] }) })
  })

  it('focuses first submenu item when opened', async () => {
    const { container } = render(<ScrumMasterDashboard />)

  // Open squad menu by clicking the Squad menu button.
  // There may be other buttons that include the word "Squad" (eg. "+ Create Squad").
  // Click the explicit squad menu button by id to open the submenu
  const squadButton = container.querySelector('#squad-menu-button') as HTMLElement | null
  if (!squadButton) throw new Error('squad menu button not found')
  fireEvent.click(squadButton)

    // The first submenu item should receive focus
    await waitFor(() => {
      const first = container.querySelector('#squad-submenu button') as HTMLButtonElement | null
      expect(first).toBeTruthy()
      expect(document.activeElement).toBe(first)
    })
  })
})
