import { test, expect } from '@playwright/test'
import { loginAsUser } from './test-helpers/auth'

test.describe('Squads tab - Successful squad creation', () => {
  test('creates squad successfully and refreshes list', async ({ page }) => {
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

    // Fill out the form
    await page.locator('[data-testid="squad-name-input"]').fill('Alpha Team')
    await page.locator('[data-testid="squad-alias-input"]').fill('alpha-team')

    // Submit the form
    await page.locator('[data-testid="create-squad-submit"]').click()

    // Verify drawer closes automatically
    const drawer = page.locator('[data-testid="squad-creation-drawer"]')
    await expect(drawer).not.toBeVisible()

    // Verify success message (if implemented)
    const successMessage = page.locator('[data-testid="squad-creation-success"]')
    if (await successMessage.isVisible()) {
      await expect(successMessage).toContainText(/created successfully|success/i)
    }

    // Verify squad appears in the list
    const squadsList = page.locator('[data-testid="squads-list"]')
    await expect(squadsList).toContainText('Alpha Team')
    await expect(squadsList).toContainText('alpha-team')

    // Verify member count shows 0 for new squad
    await expect(squadsList.locator('text=/0 members|0/i')).toBeVisible()

    // Verify empty state is no longer visible
    const emptyState = page.locator('[data-testid="squads-empty-state"]')
    await expect(emptyState).not.toBeVisible()
  })

  test('squad creation updates member count correctly', async ({ page }) => {
    // This test documents expected behavior for member count
    // Will pass once squad creation and member counting is implemented

    await loginAsUser(page, {
      email: 'scrum-master@example.com',
      name: 'Scrum Master User'
    })

    await page.goto('/dashboard/scrum-master')
    await page.locator('[data-testid="squads-tab"]').click()

    // Create a squad
    const createButton = page.locator('[data-testid="create-new-squad-button"]')
    await createButton.click()

    await page.locator('[data-testid="squad-name-input"]').fill('Beta Team')
    await page.locator('[data-testid="squad-alias-input"]').fill('beta-team')
    await page.locator('[data-testid="create-squad-submit"]').click()

    // Verify member count is 0 for new squad
    const squadsList = page.locator('[data-testid="squads-list"]')
    await expect(squadsList.locator('text=0')).toBeVisible()
  })

  test('multiple squads are displayed correctly', async ({ page }) => {
    // This test will fail until multiple squad creation is supported
    // Documents expected behavior for multiple squads

    await loginAsUser(page, {
      email: 'scrum-master@example.com',
      name: 'Scrum Master User'
    })

    await page.goto('/dashboard/scrum-master')
    await page.locator('[data-testid="squads-tab"]').click()

    // Create first squad
    await page.locator('[data-testid="create-new-squad-button"]').click()
    await page.locator('[data-testid="squad-name-input"]').fill('Team One')
    await page.locator('[data-testid="squad-alias-input"]').fill('team-one')
    await page.locator('[data-testid="create-squad-submit"]').click()

    // Create second squad
    await page.locator('[data-testid="create-new-squad-button"]').click()
    await page.locator('[data-testid="squad-name-input"]').fill('Team Two')
    await page.locator('[data-testid="squad-alias-input"]').fill('team-two')
    await page.locator('[data-testid="create-squad-submit"]').click()

    // Verify both squads are displayed
    const squadsList = page.locator('[data-testid="squads-list"]')
    await expect(squadsList).toContainText('Team One')
    await expect(squadsList).toContainText('team-one')
    await expect(squadsList).toContainText('Team Two')
    await expect(squadsList).toContainText('team-two')

    // Verify squads are ordered by creation date (most recent first)
    const squadItems = squadsList.locator('[data-testid="squad-item"]')
    await expect(squadItems.first()).toContainText('Team Two') // Most recent
    await expect(squadItems.last()).toContainText('Team One') // Older
  })
})