import { test, expect } from '@playwright/test'
import { loginAsUser } from './test-helpers/auth'

test.describe('Sprint Creation Drawer - Squad Member Display Removal', () => {
  test('squad member names are not displayed after squad selection', async ({ page }) => {
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

    // Select a squad from dropdown
    const dropdownTrigger = page.locator('[data-testid="sprint-squad-dropdown"] [role="combobox"]')
    await dropdownTrigger.click()

    const firstSquadOption = page.locator('[data-testid="sprint-squad-dropdown"] [role="option"]').first()
    await firstSquadOption.click()

    // Check that no member names are displayed in the form
    const memberDisplay = page.locator('[data-testid="sprint-selected-members"]')
    await expect(memberDisplay).not.toBeVisible()

    // Also check that no member-related text appears anywhere in the form
    const formContent = page.locator('[data-testid="sprint-drawer-content"]')
    const formText = await formContent.textContent()
    expect(formText).not.toContain('member')
    expect(formText).not.toContain('Member')
  })
})