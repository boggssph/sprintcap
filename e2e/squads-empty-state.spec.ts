import { test, expect } from '@playwright/test'
import { loginAsUser } from './test-helpers/auth'

test.describe('Squads tab - Empty state', () => {
  test('displays empty state with CTA button when Scrum Master has no squads', async ({ page }) => {
    // Login as a Scrum Master user
    await loginAsUser(page, {
      email: 'scrum-master@example.com',
      name: 'Scrum Master User'
    })

    // Navigate to dashboard
    await page.goto('/dashboard/scrum-master')

    // Click on the Squads tab
    await page.locator('[data-testid="squads-tab"]').click()

    // Verify we're on the squads tab
    await expect(page.locator('[data-testid="squads-tab"]')).toHaveAttribute('data-state', 'active')

    // Verify empty state is displayed
    const emptyState = page.locator('[data-testid="squads-empty-state"]')
    await expect(emptyState).toBeVisible()

    // Verify empty state contains helpful message
    await expect(emptyState.locator('text=/no squads|empty|get started/i')).toBeVisible()

    // Verify prominent "Create New Squad" button is visible
    const createButton = page.locator('[data-testid="create-new-squad-button"]')
    await expect(createButton).toBeVisible()
    await expect(createButton).toHaveText(/create new squad/i)

    // Verify the button is styled prominently (not just text link)
    await expect(createButton).toHaveCSS('display', 'inline-flex') // Button-like styling
  })

  test('empty state is not shown when Scrum Master has squads', async ({ page }) => {
    // This test will fail until squads exist and are displayed
    // For now, it documents the expected behavior

    await loginAsUser(page, {
      email: 'scrum-master-with-squads@example.com',
      name: 'Scrum Master With Squads'
    })

    await page.goto('/dashboard/scrum-master')
    await page.locator('[data-testid="squads-tab"]').click()

    // When squads exist, empty state should not be visible
    const emptyState = page.locator('[data-testid="squads-empty-state"]')
    await expect(emptyState).not.toBeVisible()

    // Squads list should be visible instead
    const squadsList = page.locator('[data-testid="squads-list"]')
    await expect(squadsList).toBeVisible()
  })
})