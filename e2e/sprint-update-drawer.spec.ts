import { test, expect } from '@playwright/test'

test.describe('Sprint Update Drawer', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard where sprints are displayed
    await page.goto('/dashboard')
  })

  test('should open sprint update drawer when edit button is clicked', async ({ page }) => {
    // Wait for sprint cards to load
    await page.waitForSelector('[data-testid="sprint-card"]')

    // Click the edit button on the first sprint card
    const editButton = page.locator('[data-testid="sprint-card"]').first().locator('[data-testid="edit-sprint-button"]')
    await expect(editButton).toBeVisible()
    await editButton.click()

    // Verify drawer opens
    const drawer = page.locator('[data-testid="sprint-update-drawer"]')
    await expect(drawer).toBeVisible()

    // Verify drawer title
    const title = drawer.locator('[data-testid="drawer-title"]')
    await expect(title).toContainText('Update Sprint')
  })

  test('should display current sprint data in the form', async ({ page }) => {
    // Open the drawer
    await page.locator('[data-testid="sprint-card"]').first().locator('[data-testid="edit-sprint-button"]').click()

    const drawer = page.locator('[data-testid="sprint-update-drawer"]')

    // Verify form fields are populated with current data
    const nameField = drawer.locator('[data-testid="sprint-name-input"]')
    await expect(nameField).toHaveValue(/.+/) // Should have some value

    const startDateField = drawer.locator('[data-testid="sprint-start-date-input"]')
    await expect(startDateField).toHaveValue(/.+/) // Should have some value

    const endDateField = drawer.locator('[data-testid="sprint-end-date-input"]')
    await expect(endDateField).toHaveValue(/.+/) // Should have some value

    const statusField = drawer.locator('[data-testid="sprint-status-select"]')
    await expect(statusField).toHaveValue(/.+/) // Should have some value
  })

  test('should close drawer when cancel button is clicked', async ({ page }) => {
    // Open the drawer
    await page.locator('[data-testid="sprint-card"]').first().locator('[data-testid="edit-sprint-button"]').click()

    const drawer = page.locator('[data-testid="sprint-update-drawer"]')
    await expect(drawer).toBeVisible()

    // Click cancel button
    const cancelButton = drawer.locator('[data-testid="cancel-button"]')
    await cancelButton.click()

    // Verify drawer closes
    await expect(drawer).not.toBeVisible()
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Open the drawer
    await page.locator('[data-testid="sprint-card"]').first().locator('[data-testid="edit-sprint-button"]').click()

    const drawer = page.locator('[data-testid="sprint-update-drawer"]')

    // Verify drawer takes full screen on mobile
    const drawerContent = drawer.locator('.drawer-content')
    const boundingBox = await drawerContent.boundingBox()
    expect(boundingBox?.width).toBeCloseTo(375, -10) // Should be close to full width
  })

  test('should display ceremony time fields', async ({ page }) => {
    // Open the drawer
    await page.locator('[data-testid="sprint-card"]').first().locator('[data-testid="edit-sprint-button"]').click()

    const drawer = page.locator('[data-testid="sprint-update-drawer"]')

    // Verify ceremony time fields are present
    const dailyScrumField = drawer.locator('[data-testid="daily-scrum-input"]')
    await expect(dailyScrumField).toBeVisible()

    const sprintPlanningField = drawer.locator('[data-testid="sprint-planning-input"]')
    await expect(sprintPlanningField).toBeVisible()

    const sprintReviewField = drawer.locator('[data-testid="sprint-review-input"]')
    await expect(sprintReviewField).toBeVisible()

    const retrospectiveField = drawer.locator('[data-testid="sprint-retrospective-input"]')
    await expect(retrospectiveField).toBeVisible()
  })
})