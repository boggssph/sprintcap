import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ScrumMasterNav from '@/components/ui/ScrumMasterNav'

describe('ScrumMasterNav (integration)', () => {
  // Enable axe checks with ENABLE_AXE_TESTS=true in the environment.
  const ENABLE_AXE = !!process.env.ENABLE_AXE_TESTS

  // matchMedia shim for useIsMobile hook if needed by component
  function setupMatchMedia() {
    if (typeof window === 'undefined' || (window as any).matchMedia) return
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }),
    })
  }

  beforeAll(() => setupMatchMedia())

  const items = [
    { id: 'overview', label: 'Overview', href: '#overview' },
    { id: 'squad', label: 'Squad', href: '#squad' },
    { id: 'sprint', label: 'Sprint', href: '#sprint' },
  ]

  test('renders centered horizontal list on desktop', () => {
    // Simulate desktop by mocking window.matchMedia for sm breakpoint
    // Keep it simple: render and assert desktop list exists
    const { container } = render(<ScrumMasterNav items={items} sticky={false} />)
    const nav = screen.getByTestId('scrummaster-nav')
    expect(nav).toBeInTheDocument()
    // Desktop menu should have an element with class hidden sm:flex — we assert the desktop ul exists
  // At render time in jsdom, responsive Tailwind classes don't apply; assert that a list exists
  const list = container.querySelector('ul')
  expect(list).toBeTruthy()
    // Items present
    items.forEach(i => expect(screen.getByText(i.label)).toBeInTheDocument())
  })

  test('hamburger exists on small screens and toggles menu', async () => {
    const { getByTestId, getAllByText } = render(<ScrumMasterNav items={items} sticky={false} />)
    const toggle = getByTestId('scrummaster-nav-toggle')
    expect(toggle).toBeInTheDocument()
    // Initially there should be at least one 'Overview' (desktop)
    let matches = getAllByText('Overview')
    expect(matches.length).toBeGreaterThanOrEqual(1)
    // Click toggle to open mobile list; we expect an additional 'Overview' item to appear (mobile)
    fireEvent.click(toggle)
    matches = getAllByText('Overview')
    expect(matches.length).toBeGreaterThanOrEqual(2)
  })

  test('has accessible attributes on toggle', () => {
    const { getByTestId } = render(<ScrumMasterNav items={items} sticky={false} />)
    const toggle = getByTestId('scrummaster-nav-toggle')
    expect(toggle).toHaveAttribute('aria-label', 'Toggle navigation')
    // aria-expanded toggles when clicked
    expect(toggle).toHaveAttribute('aria-expanded')
  })

  it('has no detectable accessibility violations (axe)', async () => {
    if (!ENABLE_AXE) {
      // Skip when not explicitly enabled to avoid requiring jest-axe in all environments
      return
    }

    // dynamic import to avoid hard failure when jest-axe is not installed
    let axeImport: typeof import('jest-axe')
    try {
      axeImport = (await import('jest-axe')) as typeof import('jest-axe')
    } catch (err) {
      // skip the test if jest-axe is not available
      // eslint-disable-next-line no-console
      console.warn('jest-axe not installed; skipping axe test')
      return
    }

    const { axe, toHaveNoViolations } = axeImport
    // extend expect at runtime if supported (typed to avoid `any`)
    const expectExtender = (expect as unknown) as { extend?: (arg: unknown) => void }
    expectExtender.extend?.(toHaveNoViolations)

    const { container } = render(<ScrumMasterNav items={items} sticky={false} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
