import { test, expect } from '@playwright/test'
import { loginAsUser } from './test-helpers/auth'

test.describe('Sprint Creation Drawer - Dropdown Behavior', () => {
  test('dropdown remains closed until explicitly clicked', async ({ page }) => {
    // This test should fail initially since we haven't implemented the changes yet

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

    // Check drawer is open
    const drawer = page.locator('[data-testid="sprint-creation-drawer"]')
    await expect(drawer).toBeVisible()

    // Check dropdown is closed by default
    const dropdownContent = page.locator('[data-testid="sprint-squad-dropdown"] [role="listbox"]')
    await expect(dropdownContent).not.toBeVisible()

    // Click dropdown trigger
    const dropdownTrigger = page.locator('[data-testid="sprint-squad-dropdown"] [role="combobox"]')
    await dropdownTrigger.click()

    // Now dropdown should be open
    await expect(dropdownContent).toBeVisible()

    // Click outside to close
    await page.locator('body').click({ position: { x: 10, y: 10 } })
    await expect(dropdownContent).not.toBeVisible()

    // Click trigger again
    await dropdownTrigger.click()
    await expect(dropdownContent).toBeVisible()
  })
})