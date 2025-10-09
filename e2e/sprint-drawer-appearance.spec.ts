import { test, expect } from '@playwright/test'
import { loginAsUser } from './test-helpers/auth'

test.describe('Sprint Creation Drawer - Appearance and Responsive Behavior', () => {
  test('drawer opens with 768px max width on desktop and matches squad drawer styling', async ({ page }) => {
    // This test should fail initially since we haven't implemented the changes yet

    // Set desktop viewport (≥1024px)
    await page.setViewportSize({ width: 1280, height: 720 })

    // Login as a Scrum Master user
    await loginAsUser(page, {
      email: 'scrum-master@example.com',
      name: 'Scrum Master User'
    })

    // Navigate to dashboard and sprints tab
    await page.goto('/dashboard/scrum-master')
    await page.locator('[data-testid="sprints-tab"]').click()

    // Click the "Create New Sprint" button
    const createButton = page.locator('[data-testid="create-new-sprint-button"]')
    await createButton.click()

    // Verify drawer opens
    const drawer = page.locator('[data-testid="sprint-creation-drawer"]')
    await expect(drawer).toBeVisible()

    // Verify drawer content has width constraints (768px max width)
    const drawerContent = drawer.locator('[data-testid="sprint-drawer-content"]')
    await expect(drawerContent).toBeVisible()

    // Check max width constraint
    const maxWidth = await drawerContent.evaluate(el => getComputedStyle(el).maxWidth)
    expect(maxWidth).toBe('768px')

    // Check responsive behavior - should be full width on mobile
    await page.setViewportSize({ width: 640, height: 800 }) // Mobile breakpoint
    const mobileWidth = await drawerContent.evaluate(el => getComputedStyle(el).width)
    expect(mobileWidth).toBe('100%')

    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 })

    // Compare styling with squad drawer
    await page.locator('[data-testid="squads-tab"]').click()
    await page.locator('[data-testid="create-new-squad-button"]').click()
    const squadDrawer = page.locator('[data-testid="drawer-content"]')

    // Compare key styling properties
    const sprintPadding = await drawerContent.evaluate(el => getComputedStyle(el).padding)
    const squadPadding = await squadDrawer.evaluate(el => getComputedStyle(el).padding)
    expect(sprintPadding).toBe(squadPadding)

    const sprintSpacing = await drawerContent.evaluate(el => getComputedStyle(el).gap)
    const squadSpacing = await squadDrawer.evaluate(el => getComputedStyle(el).gap)
    expect(sprintSpacing).toBe(squadSpacing)
  })
})