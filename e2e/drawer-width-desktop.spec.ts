import { test, expect } from '@playwright/test'
import { loginAsUser } from './test-helpers/auth'

test.describe('Squad Creation Drawer - Desktop Width Consistency', () => {
  test('drawer content is constrained to max-width 7xl and centered on desktop screens', async ({ page }) => {
    // Set desktop viewport (≥1024px)
    await page.setViewportSize({ width: 1280, height: 720 })

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

    // Verify drawer content has width constraints
    const drawerContent = drawer.locator('[data-testid="drawer-content"]')
    await expect(drawerContent).toBeVisible()

    // Check that drawer content has max-width constraint applied
    // The drawer content should have lg:max-w-7xl class applied
    const className = await drawerContent.getAttribute('class')
    expect(className).toContain('lg:max-w-7xl')
    expect(className).toContain('lg:mx-auto')

    // Verify drawer content width is constrained (should be less than full viewport width)
    const drawerBox = await drawerContent.boundingBox()
    const viewportSize = page.viewportSize()

    if (drawerBox && viewportSize) {
      // Drawer content should be constrained to max-w-7xl (1280px equivalent)
      // Allow some tolerance for padding/margins
      expect(drawerBox.width).toBeLessThanOrEqual(1312) // 1280 + some padding
      expect(drawerBox.width).toBeGreaterThan(1000) // Should be reasonably wide

      // Drawer should be horizontally centered
      const centerX = drawerBox.x + drawerBox.width / 2
      const viewportCenterX = viewportSize.width / 2
      const centerTolerance = 50 // Allow some tolerance for centering
      expect(Math.abs(centerX - viewportCenterX)).toBeLessThan(centerTolerance)
    }
  })

  test('drawer width matches dashboard content constraints on wide screens', async ({ page }) => {
    // Set wide desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Login as a Scrum Master user
    await loginAsUser(page, {
      email: 'scrum-master@example.com',
      name: 'Scrum Master User'
    })

    // Navigate to dashboard
    await page.goto('/dashboard/scrum-master')

    // Get the width of a dashboard content area (like the main content area)
    const dashboardContent = page.locator('[data-testid="dashboard-content"]').or(
      page.locator('.max-w-7xl').first()
    )

    let dashboardWidth = 0
    if (await dashboardContent.isVisible()) {
      const dashboardBox = await dashboardContent.boundingBox()
      if (dashboardBox) {
        dashboardWidth = dashboardBox.width
      }
    }

    // Navigate to squads tab and open drawer
    await page.locator('[data-testid="squads-tab"]').click()
    const createButton = page.locator('[data-testid="create-new-squad-button"]')
    await createButton.click()

    // Check drawer content width
    const drawerContent = page.locator('[data-testid="squad-creation-drawer"] [data-testid="drawer-content"]')
    const drawerBox = await drawerContent.boundingBox()

    if (drawerBox && dashboardWidth > 0) {
      // Drawer should have similar width constraints to dashboard content
      const widthDifference = Math.abs(drawerBox.width - dashboardWidth)
      expect(widthDifference).toBeLessThan(100) // Allow some tolerance
    }
  })
})