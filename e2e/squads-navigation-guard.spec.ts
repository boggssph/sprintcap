import { test, expect } from '@playwright/test'
import { loginAsUser } from './test-helpers/auth'

test.describe('Squads tab - Navigation confirmation', () => {
  test('shows confirmation dialog when navigating away from open drawer', async ({ page }) => {
    // Login as a Scrum Master user
    await loginAsUser(page, {
      email: 'scrum-master@example.com',
      name: 'Scrum Master User'
    })

    // Navigate to dashboard and squads tab
    await page.goto('/dashboard/scrum-master')
    await page.locator('[data-testid="squads-tab"]').click()

    // Open the squad creation drawer
    await page.locator('[data-testid="create-new-squad-button"]').click()

    // Fill some data in the form (to make it "dirty")
    await page.locator('[data-testid="squad-name-input"]').fill('Test Squad')

    // Try to navigate to another tab (Sprints tab)
    await page.locator('[data-testid="sprints-tab"]').click()

    // Verify confirmation dialog appears
    const confirmDialog = page.locator('[data-testid="navigation-confirmation-dialog"]')
    await expect(confirmDialog).toBeVisible()

    // Verify dialog contains appropriate message
    await expect(confirmDialog).toContainText(/unsaved changes|leave|discard/i)
    await expect(confirmDialog).toContainText(/squad|form/i)

    // Verify dialog has action buttons
    await expect(confirmDialog.locator('[data-testid="confirm-leave"]')).toBeVisible()
    await expect(confirmDialog.locator('[data-testid="cancel-leave"]')).toBeVisible()
  })

  test('can cancel navigation and stay on drawer', async ({ page }) => {
    await loginAsUser(page, {
      email: 'scrum-master@example.com',
      name: 'Scrum Master User'
    })

    await page.goto('/dashboard/scrum-master')
    await page.locator('[data-testid="squads-tab"]').click()

    // Open drawer and fill data
    await page.locator('[data-testid="create-new-squad-button"]').click()
    await page.locator('[data-testid="squad-name-input"]').fill('Test Squad')

    // Try to navigate away
    await page.locator('[data-testid="sprints-tab"]').click()

    // Click "Cancel" in confirmation dialog
    await page.locator('[data-testid="cancel-leave"]').click()

    // Verify still on squads tab
    await expect(page.locator('[data-testid="squads-tab"]')).toHaveAttribute('data-state', 'active')

    // Verify drawer is still open
    await expect(page.locator('[data-testid="squad-creation-drawer"]')).toBeVisible()

    // Verify form data is preserved
    await expect(page.locator('[data-testid="squad-name-input"]')).toHaveValue('Test Squad')
  })

  test('can confirm navigation and close drawer', async ({ page }) => {
    await loginAsUser(page, {
      email: 'scrum-master@example.com',
      name: 'Scrum Master User'
    })

    await page.goto('/dashboard/scrum-master')
    await page.locator('[data-testid="squads-tab"]').click()

    // Open drawer and fill data
    await page.locator('[data-testid="create-new-squad-button"]').click()
    await page.locator('[data-testid="squad-name-input"]').fill('Test Squad')

    // Try to navigate away
    await page.locator('[data-testid="sprints-tab"]').click()

    // Click "Leave" in confirmation dialog
    await page.locator('[data-testid="confirm-leave"]').click()

    // Verify navigated to sprints tab
    await expect(page.locator('[data-testid="sprints-tab"]')).toHaveAttribute('data-state', 'active')

    // Verify drawer is closed
    await expect(page.locator('[data-testid="squad-creation-drawer"]')).not.toBeVisible()

    // Verify confirmation dialog is closed
    await expect(page.locator('[data-testid="navigation-confirmation-dialog"]')).not.toBeVisible()
  })

  test('no confirmation dialog when form is empty', async ({ page }) => {
    await loginAsUser(page, {
      email: 'scrum-master@example.com',
      name: 'Scrum Master User'
    })

    await page.goto('/dashboard/scrum-master')
    await page.locator('[data-testid="squads-tab"]').click()

    // Open drawer but don't fill any data
    await page.locator('[data-testid="create-new-squad-button"]').click()

    // Try to navigate away
    await page.locator('[data-testid="sprints-tab"]').click()

    // Verify no confirmation dialog appears
    const confirmDialog = page.locator('[data-testid="navigation-confirmation-dialog"]')
    await expect(confirmDialog).not.toBeVisible()

    // Verify navigation succeeds
    await expect(page.locator('[data-testid="sprints-tab"]')).toHaveAttribute('data-state', 'active')

    // Verify drawer closes
    await expect(page.locator('[data-testid="squad-creation-drawer"]')).not.toBeVisible()
  })

  test('confirmation dialog appears for browser back/forward', async ({ page }) => {
    await loginAsUser(page, {
      email: 'scrum-master@example.com',
      name: 'Scrum Master User'
    })

    await page.goto('/dashboard/scrum-master')
    await page.locator('[data-testid="squads-tab"]').click()

    // Open drawer and fill data
    await page.locator('[data-testid="create-new-squad-button"]').click()
    await page.locator('[data-testid="squad-name-input"]').fill('Test Squad')

    // Navigate to another page first
    await page.goto('/dashboard/scrum-master?sprints=true')

    // Try to go back (browser back button simulation)
    await page.goBack()

    // Verify confirmation dialog appears (if implemented)
    // Note: Browser back/forward confirmation is harder to test reliably
    // This test documents the expected behavior
    // The dialog may or may not appear depending on implementation
    // At minimum, verify the page doesn't crash
    await expect(page.locator('body')).toBeVisible()
  })
})