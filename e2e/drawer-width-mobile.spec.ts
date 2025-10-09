import { test, expect } from '@playwright/test'
import { loginAsUser } from './test-helpers/auth'

test.describe('Squad Creation Drawer - Mobile Responsiveness', () => {
  test('drawer takes full available width on screens smaller than 1024px', async ({ page }) => {
    // Set tablet/mobile viewport (<1024px)
    await page.setViewportSize({ width: 768, height: 1024 })

    // Login as a Scrum Master user
    await loginAsUser(page, {
      email: 'scrum-master@example.com',
      name: 'Scrum Master User'
    })

    // Navigate to dashboard and squads tab
    await page.goto('/dashboard/scrum-master')
    await page.locator('[data-testid="squads-tab"]').click()

    // Click the "Create New Squad" button
    const createButton = page.locator('[data-testid="create-new-squad-button"]')
    await createButton.click()

    // Verify drawer opens
    const drawer = page.locator('[data-testid="squad-creation-drawer"]')
    await expect(drawer).toBeVisible()

    // Verify drawer content does NOT have width constraints on smaller screens
    const drawerContent = drawer.locator('[data-testid="drawer-content"]')
    await expect(drawerContent).toBeVisible()

    // Check that drawer content does NOT have lg: responsive classes applied
    // (The classes should exist but not be active on this screen size)
    const className = await drawerContent.getAttribute('class')
    expect(className).toContain('lg:max-w-7xl') // Class exists but not applied
    expect(className).toContain('lg:mx-auto')   // Class exists but not applied

    // Verify drawer content takes full available width
    const drawerBox = await drawerContent.boundingBox()
    const viewportSize = page.viewportSize()

    if (drawerBox && viewportSize) {
      // On screens < 1024px, drawer should take full width (no max-width constraint)
      // Allow some tolerance for padding/margins
      const widthRatio = drawerBox.width / viewportSize.width
      expect(widthRatio).toBeGreaterThan(0.9) // Should take at least 90% of viewport width
    }
  })

  test('drawer functions as full-screen overlay on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Login as a Scrum Master user
    await loginAsUser(page, {
      email: 'scrum-master@example.com',
      name: 'Scrum Master User'
    })

    // Navigate to dashboard and squads tab
    await page.goto('/dashboard/scrum-master')
    await page.locator('[data-testid="squads-tab"]').click()

    // Click the "Create New Squad" button
    const createButton = page.locator('[data-testid="create-new-squad-button"]')
    await createButton.click()

    // Verify drawer opens in full-screen mode
    const drawer = page.locator('[data-testid="squad-creation-drawer"]')
    await expect(drawer).toBeVisible()

    // Verify drawer takes up most of the screen height (full-screen behavior)
    const drawerBox = await drawer.boundingBox()
    const viewportSize = page.viewportSize()

    if (drawerBox && viewportSize) {
      // Drawer should take at least 85% of screen height on mobile
      const heightRatio = drawerBox.height / viewportSize.height
      expect(heightRatio).toBeGreaterThan(0.85)

      // Drawer should take full width (no constraints)
      const widthRatio = drawerBox.width / viewportSize.width
      expect(widthRatio).toBeGreaterThan(0.95)
    }

    // Verify drawer content is not constrained by max-width on mobile
    const drawerContent = drawer.locator('[data-testid="drawer-content"]')
    const contentBox = await drawerContent.boundingBox()

    if (contentBox && drawerBox && viewportSize) {
      // Content should take full available width within the drawer
      const contentWidthRatio = contentBox.width / drawerBox.width
      expect(contentWidthRatio).toBeGreaterThan(0.9)
    }
  })

  test('drawer behavior changes appropriately at 1024px breakpoint', async ({ page }) => {
    // Test just below breakpoint (1023px)
    await page.setViewportSize({ width: 1023, height: 768 })

    await loginAsUser(page, {
      email: 'scrum-master@example.com',
      name: 'Scrum Master User'
    })

    await page.goto('/dashboard/scrum-master')
    await page.locator('[data-testid="squads-tab"]').click()

    const createButton = page.locator('[data-testid="create-new-squad-button"]')
    await createButton.click()

    const drawerContent = page.locator('[data-testid="squad-creation-drawer"] [data-testid="drawer-content"]')
    const drawerBox1 = await drawerContent.boundingBox()
    const viewportSize1 = page.viewportSize()

    // Content should take full width (no constraints below 1024px)
    if (drawerBox1 && viewportSize1) {
      const widthRatio1 = drawerBox1.width / viewportSize1.width
      expect(widthRatio1).toBeGreaterThan(0.9)
    }

    // Close drawer
    await page.keyboard.press('Escape')

    // Test just above breakpoint (1025px)
    await page.setViewportSize({ width: 1025, height: 768 })

    // Re-open drawer
    await createButton.click()

    const drawerBox2 = await drawerContent.boundingBox()
    const viewportSize2 = page.viewportSize()

    // Content should be constrained above 1024px
    if (drawerBox2 && viewportSize2) {
      // Should be constrained to max-w-7xl (not full width)
      expect(drawerBox2.width).toBeLessThan(viewportSize2.width * 0.9)
      expect(drawerBox2.width).toBeLessThanOrEqual(1312) // max-w-7xl + padding
    }
  })
})