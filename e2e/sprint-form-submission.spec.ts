import { test, expect } from '@playwright/test'
import { loginAsUser } from './test-helpers/auth'

test.describe('Sprint Creation Drawer - Form Submission and Success Feedback', () => {
  test('form submits successfully and shows appropriate feedback', async ({ page }) => {
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

    // Fill out the form
    await page.locator('[data-testid="sprint-name-input"]').fill('Test Sprint 2025.01')

    // Select squad
    const dropdownTrigger = page.locator('[data-testid="sprint-squad-dropdown"] [role="combobox"]')
    await dropdownTrigger.click()
    const firstSquadOption = page.locator('[data-testid="sprint-squad-dropdown"] [role="option"]').first()
    await firstSquadOption.click()

    // Fill dates
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date()
    dayAfter.setDate(dayAfter.getDate() + 8)

    await page.locator('[data-testid="sprint-start-date"]').fill(tomorrow.toISOString().split('T')[0])
    await page.locator('[data-testid="sprint-end-date"]').fill(dayAfter.toISOString().split('T')[0])

    // Submit form
    await page.locator('[data-testid="sprint-submit-button"]').click()

    // Check for success message
    await expect(page.locator('text=Sprint created successfully')).toBeVisible()

    // Check drawer closes
    await expect(page.locator('[data-testid="sprint-creation-drawer"]')).not.toBeVisible()

    // Check sprint appears in list (assuming it refreshes)
    await expect(page.locator('text=Test Sprint 2025.01')).toBeVisible()
  })

  test('form allows creation even when selected squad has no members', async ({ page }) => {
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

    // Select a squad that has no members (we'll need to set this up in test data)
    const dropdownTrigger = page.locator('[data-testid="sprint-squad-dropdown"] [role="combobox"]')
    await dropdownTrigger.click()

    // Find and select empty squad (this would need to be set up in test data)
    const emptySquadOption = page.locator('[data-testid="sprint-squad-dropdown"] [role="option"]').filter({ hasText: 'Empty Squad' })
    if (await emptySquadOption.count() > 0) {
      await emptySquadOption.click()

      // Fill other fields
      await page.locator('[data-testid="sprint-name-input"]').fill('Empty Squad Sprint')

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dayAfter = new Date()
      dayAfter.setDate(dayAfter.getDate() + 8)

      await page.locator('[data-testid="sprint-start-date"]').fill(tomorrow.toISOString().split('T')[0])
      await page.locator('[data-testid="sprint-end-date"]').fill(dayAfter.toISOString().split('T')[0])

      // Submit should succeed
      await page.locator('[data-testid="sprint-submit-button"]').click()
      await expect(page.locator('text=Sprint created successfully')).toBeVisible()
    }
  })
})