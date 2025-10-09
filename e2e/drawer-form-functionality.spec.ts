import { test, expect } from '@playwright/test'
import { loginAsUser } from './test-helpers/auth'

test.describe('Squad Creation Drawer - Form Functionality Preservation', () => {
  test('form fields remain fully functional after width constraint changes', async ({ page }) => {
    // Set desktop viewport to test with constraints applied
    await page.setViewportSize({ width: 1280, height: 720 })

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

    // Verify drawer opens
    const drawer = page.locator('[data-testid="squad-creation-drawer"]')
    await expect(drawer).toBeVisible()

    // Test squad name input functionality
    const nameInput = drawer.locator('[data-testid="squad-name-input"]')
    await expect(nameInput).toBeVisible()
    await expect(nameInput).toBeEnabled()

    // Type in squad name
    const testSquadName = 'Test Squad Width Constraints'
    await nameInput.fill(testSquadName)
    await expect(nameInput).toHaveValue(testSquadName)

    // Test squad alias input functionality
    const aliasInput = drawer.locator('[data-testid="squad-alias-input"]')
    await expect(aliasInput).toBeVisible()
    await expect(aliasInput).toBeEnabled()

    // Type in squad alias
    const testSquadAlias = 'width-test'
    await aliasInput.fill(testSquadAlias)
    await expect(aliasInput).toHaveValue(testSquadAlias)

    // Test form submission button
    const submitButton = drawer.locator('[data-testid="create-squad-submit"]')
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toBeEnabled()

    // Test cancel button
    const cancelButton = drawer.locator('[data-testid="cancel-squad-creation"]')
    await expect(cancelButton).toBeVisible()
    await expect(cancelButton).toBeEnabled()
  })

  test('form validation messages display correctly with width constraints', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 })

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

    // Verify drawer opens
    const drawer = page.locator('[data-testid="squad-creation-drawer"]')
    await expect(drawer).toBeVisible()

    // Try to submit empty form to trigger validation
    const submitButton = drawer.locator('[data-testid="create-squad-submit"]')
    await submitButton.click()

    // Check for validation messages (these should still be visible and properly positioned)
    // Note: Exact validation message selectors may vary based on implementation
    const validationMessages = drawer.locator('.text-red-500, .text-destructive, [data-testid*="error"]')
    const messageCount = await validationMessages.count()

    // Should have at least one validation message for required fields
    expect(messageCount).toBeGreaterThan(0)

    // Verify validation messages are visible and not cut off by width constraints
    for (let i = 0; i < messageCount; i++) {
      const message = validationMessages.nth(i)
      await expect(message).toBeVisible()

      // Check that message is properly positioned within the constrained width
      const messageBox = await message.boundingBox()
      if (messageBox) {
        expect(messageBox.width).toBeGreaterThan(0)
        expect(messageBox.height).toBeGreaterThan(0)
      }
    }
  })

  test('form maintains functionality across different screen sizes', async ({ page }) => {
    // Test on multiple screen sizes to ensure form works with and without constraints

    const viewports = [
      { width: 1920, height: 1080, name: 'desktop-wide' },
      { width: 1024, height: 768, name: 'desktop-breakpoint' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ]

    for (const viewport of viewports) {
      await test.step(`Form functionality on ${viewport.name} (${viewport.width}x${viewport.height})`, async () => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })

        // Login if not already logged in
        if (page.url().includes('/auth') || !(await page.locator('[data-testid="squads-tab"]').isVisible())) {
          await loginAsUser(page, {
            email: 'scrum-master@example.com',
            name: 'Scrum Master User'
          })
          await page.goto('/dashboard/scrum-master')
        }

        // Navigate to squads tab
        await page.locator('[data-testid="squads-tab"]').click()

        // Open drawer
        const createButton = page.locator('[data-testid="create-new-squad-button"]')
        await createButton.click()

        // Verify drawer opens
        const drawer = page.locator('[data-testid="squad-creation-drawer"]')
        await expect(drawer).toBeVisible()

        // Test basic form interaction
        const nameInput = drawer.locator('[data-testid="squad-name-input"]')
        const aliasInput = drawer.locator('[data-testid="squad-alias-input"]')
        const submitButton = drawer.locator('[data-testid="create-squad-submit"]')

        await expect(nameInput).toBeVisible()
        await expect(aliasInput).toBeVisible()
        await expect(submitButton).toBeVisible()

        // Quick interaction test
        await nameInput.fill(`Test ${viewport.name}`)
        await aliasInput.fill(`test-${viewport.name}`)
        await expect(nameInput).toHaveValue(`Test ${viewport.name}`)
        await expect(aliasInput).toHaveValue(`test-${viewport.name}`)

        // Close drawer for next test
        await page.keyboard.press('Escape')
        await expect(drawer).not.toBeVisible()
      })
    }
  })
})