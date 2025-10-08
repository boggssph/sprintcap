import React from 'react'
import { render } from '@testing-library/react'
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger } from '@/components/ui/navigation-menu'

// Skip unless explicitly enabled (avoids requiring jest-axe in all environments)
const ENABLE_AXE = !!process.env.ENABLE_AXE_TESTS

// matchMedia shim for useIsMobile hook
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

describe('Sidebar a11y (axe)', () => {
  if (!ENABLE_AXE) {
    it('disabled by default - set ENABLE_AXE_TESTS=true to run axe checks', () => {})
    return
  }

  beforeAll(() => setupMatchMedia())

  it('has no detectable accessibility violations', async () => {
    // dynamic import to avoid hard failure when jest-axe is not installed
    let axeImport: any
    try {
      axeImport = await import('jest-axe')
    } catch (err) {
      // skip the test if jest-axe is not available
      console.warn('jest-axe not installed; skipping axe test')
      return
    }
    const { axe, toHaveNoViolations } = axeImport
    // extend expect at runtime
    ;(expect as any).extend ? (expect as any).extend(toHaveNoViolations) : void 0

    const { container } = render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Overview</NavigationMenuTrigger>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Squad</NavigationMenuTrigger>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
