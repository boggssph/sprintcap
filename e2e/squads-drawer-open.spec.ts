import { test, expect } from '@playwright/test'
import { loginAsUser } from './test-helpers/auth'

test.describe('Squads tab - Create button opens drawer', () => {
  test('clicking "Create New Squad" button opens drawer with form', async ({ page }) => {
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

    // Verify drawer contains form elements
    await expect(drawer.locator('[data-testid="squad-name-input"]')).toBeVisible()
    await expect(drawer.locator('[data-testid="squad-alias-input"]')).toBeVisible()
    await expect(drawer.locator('[data-testid="create-squad-submit"]')).toBeVisible()
    await expect(drawer.locator('[data-testid="cancel-squad-creation"]')).toBeVisible()

    // Verify drawer title
    await expect(drawer.locator('text=/create new squad|new squad/i')).toBeVisible()
  })

  test('drawer opens on mobile with full-screen behavior', async ({ page }) => {
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

    // Verify drawer opens in full-screen mode on mobile
    const drawer = page.locator('[data-testid="squad-creation-drawer"]')
    await expect(drawer).toBeVisible()

    // Check that drawer takes most of the screen height
    const drawerBox = await drawer.boundingBox()
    const viewportSize = page.viewportSize()
    if (drawerBox && viewportSize) {
      // Drawer should take at least 80% of screen height on mobile
      const heightRatio = drawerBox.height / viewportSize.height
      expect(heightRatio).toBeGreaterThan(0.8)
    }
  })

  test('drawer does not open when button is not visible', async ({ page }) => {
    // Login as a Scrum Master user
    await loginAsUser(page, {
      email: 'scrum-master@example.com',
      name: 'Scrum Master User'
    })

    // Navigate to dashboard but stay on different tab (not squads)
    await page.goto('/dashboard/scrum-master')

    // Verify "Create New Squad" button is not visible on other tabs
    const createButton = page.locator('[data-testid="create-new-squad-button"]')
    await expect(createButton).not.toBeVisible()

    // Verify drawer is not open
    const drawer = page.locator('[data-testid="squad-creation-drawer"]')
    await expect(drawer).not.toBeVisible()
  })
})