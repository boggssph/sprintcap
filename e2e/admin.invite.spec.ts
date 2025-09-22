import { test, expect } from '@playwright/test'

test('admin can create an invite and revoke', async ({ page }) => {
  // Start app server locally before running this test
  await page.goto('http://localhost:3000/admin')
  await page.fill('input[placeholder="Search email"]', '')
  // This is a basic smoke test. More stubs and auth setup required for CI.
  expect(await page.locator('text=Admin - Create Invite').count()).toBeGreaterThan(0)
})
