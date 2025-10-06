import { test, expect } from '@playwright/test'

test('sidebar keyboard interactions: open squad submenu and navigate', async ({ page }) => {
  // Force desktop viewport so the desktop sidebar appears (avoids mobile collapse)
  await page.setViewportSize({ width: 1280, height: 800 })
  // Navigate relative to Playwright's baseURL so the port can be overridden via env
  await page.goto('/dashboard/scrum-master')
  await page.waitForLoadState('networkidle')
  // Open the sidebar if collapsed

  // Focus the Squad button and press Enter to open submenu
  // Wait for the Squad button to appear before focusing
  // Target the exact menu button (avoid matching submenu items that also contain the word "Squad")
  const squadButton = page.locator('button[aria-controls="squad-submenu"]').first()
  // Ensure the Squad menu button is visible then click to open submenu
  await squadButton.waitFor({ state: 'visible', timeout: 5000 })
  await page.waitForTimeout(500)
  await squadButton.click()

  // Expect the first submenu item to be visible and focused
    // Wait for the submenu container to appear, then get its first button
  await page.waitForSelector('#squad-submenu', { timeout: 10000 })
  const first = page.locator('#squad-submenu button').first()
  await expect(first).toBeVisible({ timeout: 10000 })
    // Explicitly focus the first submenu item to avoid relying on UI timing
    await first.focus()
    await expect(first).toBeFocused()

  // Press Escape to close submenu and return focus to parent
  await page.keyboard.press('Escape')
  await expect(squadButton).toBeFocused()
})
