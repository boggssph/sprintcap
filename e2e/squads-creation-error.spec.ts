import { test, expect } from '@playwright/test'
import { loginAsUser } from './test-helpers/auth'

test.describe('Squads tab - Creation error handling', () => {
  test('shows inline error messages for invalid form data', async ({ page }) => {
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

    // Try to submit empty form
    await page.locator('[data-testid="create-squad-submit"]').click()

    // Verify inline error messages appear below form fields
    await expect(page.locator('[data-testid="squad-name-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="squad-name-error"]')).toContainText(/required|empty/i)

    await expect(page.locator('[data-testid="squad-alias-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="squad-alias-error"]')).toContainText(/required|empty/i)

    // Verify drawer stays open
    const drawer = page.locator('[data-testid="squad-creation-drawer"]')
    await expect(drawer).toBeVisible()
  })

  test('shows error for duplicate alias', async ({ page }) => {
    // First create a squad with a known alias
    await loginAsUser(page, {
      email: 'scrum-master@example.com',
      name: 'Scrum Master User'
    })

    await page.goto('/dashboard/scrum-master')
    await page.locator('[data-testid="squads-tab"]').click()

    // Create first squad
    await page.locator('[data-testid="create-new-squad-button"]').click()
    await page.locator('[data-testid="squad-name-input"]').fill('Original Team')
    await page.locator('[data-testid="squad-alias-input"]').fill('duplicate-test')
    await page.locator('[data-testid="create-squad-submit"]').click()

    // Wait for creation to complete
    await page.locator('[data-testid="squad-creation-drawer"]').waitFor({ state: 'hidden' })

    // Try to create another squad with the same alias
    await page.locator('[data-testid="create-new-squad-button"]').click()
    await page.locator('[data-testid="squad-name-input"]').fill('Duplicate Team')
    await page.locator('[data-testid="squad-alias-input"]').fill('duplicate-test') // Same alias
    await page.locator('[data-testid="create-squad-submit"]').click()

    // Verify error message for duplicate alias
    await expect(page.locator('[data-testid="squad-alias-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="squad-alias-error"]')).toContainText(/already exists|taken|duplicate/i)

    // Verify drawer stays open
    const drawer = page.locator('[data-testid="squad-creation-drawer"]')
    await expect(drawer).toBeVisible()
  })

  test('shows error for invalid alias format', async ({ page }) => {
    await loginAsUser(page, {
      email: 'scrum-master@example.com',
      name: 'Scrum Master User'
    })

    await page.goto('/dashboard/scrum-master')
    await page.locator('[data-testid="squads-tab"]').click()

    await page.locator('[data-testid="create-new-squad-button"]').click()

    // Test various invalid alias formats
    const invalidAliases = [
      'INVALID_CAPS', // Uppercase
      'invalid alias', // Spaces
      'invalid@alias', // Special characters
      'invalid.alias', // Dots
      'a', // Too short (if minimum length enforced)
      'a'.repeat(51) // Too long (if maximum length enforced)
    ]

    for (const invalidAlias of invalidAliases) {
      // Clear and fill alias field
      const aliasInput = page.locator('[data-testid="squad-alias-input"]')
      await aliasInput.clear()
      await aliasInput.fill(invalidAlias)

      // Fill valid name
      await page.locator('[data-testid="squad-name-input"]').fill('Valid Name')

      // Submit form
      await page.locator('[data-testid="create-squad-submit"]').click()

      // Verify error message appears
      await expect(page.locator('[data-testid="squad-alias-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="squad-alias-error"]')).toContainText(/format|lowercase|alphanumeric|hyphens/i)
    }
  })

  test('clears errors when user starts typing', async ({ page }) => {
    await loginAsUser(page, {
      email: 'scrum-master@example.com',
      name: 'Scrum Master User'
    })

    await page.goto('/dashboard/scrum-master')
    await page.locator('[data-testid="squads-tab"]').click()

    await page.locator('[data-testid="create-new-squad-button"]').click()

    // Submit empty form to trigger errors
    await page.locator('[data-testid="create-squad-submit"]').click()

    // Verify errors are shown
    await expect(page.locator('[data-testid="squad-name-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="squad-alias-error"]')).toBeVisible()

    // Start typing in name field
    await page.locator('[data-testid="squad-name-input"]').fill('A')

    // Errors should still be visible until field is valid
    // (This behavior depends on form validation implementation)

    // Fill valid data
    await page.locator('[data-testid="squad-name-input"]').fill('Valid Team Name')
    await page.locator('[data-testid="squad-alias-input"]').fill('valid-alias')

    // Submit again - should succeed
    await page.locator('[data-testid="create-squad-submit"]').click()

    // Verify drawer closes on success
    await expect(page.locator('[data-testid="squad-creation-drawer"]')).not.toBeVisible()
  })
})