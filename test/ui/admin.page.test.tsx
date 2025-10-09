import React from 'react'
import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'

// make React available globally for JSX runtime in test environment
;(globalThis as unknown as { React?: typeof React }).React = React

// mock next/navigation's useRouter to avoid app router mounting requirement
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: () => {} }),
}))

import AdminPage from '../../app/admin/page'

describe('AdminPage UI', () => {
  beforeEach(() => {
    // mock fetch to return empty invites
    // ignore params intentionally
    global.fetch = () => {
      return Promise.resolve(new Response(JSON.stringify({ invites: [], nextCursor: null }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    }
    // mock clipboard
    // @ts-expect-error - test env: provide clipboard mock
    global.navigator.clipboard = { writeText: () => Promise.resolve() }
  })

  it('renders form and inputs', async () => {
    render(
      <SessionProvider session={null}>
        <AdminPage />
      </SessionProvider>
    )
    expect(await screen.findByText(/Create New Invite/i)).toBeInTheDocument()
  // The form labels in the component are not linked via htmlFor/id,
  // so query by role instead: a textbox for email and multiple comboboxes.
  expect(screen.getAllByRole('textbox').length).toBeGreaterThanOrEqual(1)
  // there are two selects: role and status filter
  expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(2)
    // ensure the create button exists (target the button role to avoid header collision)
    expect(screen.getByRole('button', { name: /Create Invite/i })).toBeInTheDocument()
  })
})
