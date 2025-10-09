import { test, expect } from '@playwright/test'

// Contract test: renders the ScrumMaster dashboard and snapshots region of nav
test.describe('ScrumMasterNav contract', () => {
  test('desktop: centered nav snapshot', async ({ page }) => {
    await page.goto('/dashboard/scrum-master')
    await page.setViewportSize({ width: 1280, height: 800 })
    const nav = await page.locator('[data-testid="scrummaster-nav"]')
    await expect(nav).toBeVisible()
    // take a region snapshot of the nav area
    await expect(nav).toHaveScreenshot('scrummaster-nav.desktop.png', { animations: 'disabled', threshold: 0.02 })
  })

  test('mobile: hamburger collapsed and expands', async ({ page }) => {
    await page.goto('/dashboard/scrum-master')
    await page.setViewportSize({ width: 375, height: 800 })
    const toggle = page.locator('[data-testid="scrummaster-nav-toggle"]')
    await expect(toggle).toBeVisible()
    await toggle.click()
    const nav = page.locator('[data-testid="scrummaster-nav"]')
    await expect(nav).toBeVisible()
    await expect(nav).toHaveScreenshot('scrummaster-nav.mobile-open.png', { animations: 'disabled', threshold: 0.02 })
  })
})
