import { test, expect } from '@playwright/test'
import { loginAsUser } from './test-helpers/auth'

test.describe('Squads tab - Vertical stacking with member lists', () => {
  test('squad cards display in vertical stack layout instead of grid', async ({ page }) => {
    // Login as a Scrum Master user with existing squads
    await loginAsUser(page, {
      email: 'scrum-master-with-squads@example.com',
      name: 'Scrum Master With Squads'
    })

    // Navigate to dashboard and squads tab
    await page.goto('/dashboard/scrum-master')
    await page.locator('[data-testid="squads-tab"]').click()

    // Verify squads list is visible
    const squadsList = page.locator('[data-testid="squads-list"]')
    await expect(squadsList).toBeVisible()

    // Verify cards are displayed in a single column (vertical stack)
    // Check that the grid classes don't include responsive columns
    const squadCards = page.locator('[data-testid="squad-card"]')
    const cardCount = await squadCards.count()

    if (cardCount > 1) {
      // Cards should be stacked vertically, not in a grid
      // Check that parent container doesn't have grid-cols classes
      const container = squadsList.locator('..') // Get parent of squads-list
      const classList = await container.getAttribute('class')
      expect(classList).not.toContain('md:grid-cols-')
      expect(classList).not.toContain('lg:grid-cols-')
    }
  })

  test('squad cards show member lists with names and join dates', async ({ page }) => {
    // Login as a Scrum Master user with squads that have members
    await loginAsUser(page, {
      email: 'scrum-master-with-members@example.com',
      name: 'Scrum Master With Members'
    })

    // Navigate to dashboard and squads tab
    await page.goto('/dashboard/scrum-master')
    await page.locator('[data-testid="squads-tab"]').click()

    // Find a squad card with members
    const squadCard = page.locator('[data-testid="squad-card"]').first()
    await expect(squadCard).toBeVisible()

    // Verify member list is displayed within the card
    const memberList = squadCard.locator('[data-testid="squad-members-list"]')
    await expect(memberList).toBeVisible()

    // Verify at least one member is shown with name and date
    const memberItems = memberList.locator('[data-testid="squad-member-item"]')
    const memberCount = await memberItems.count()
    expect(memberCount).toBeGreaterThan(0)

    // Check that each member shows name and join date
    for (let i = 0; i < Math.min(memberCount, 3); i++) {
      const memberItem = memberItems.nth(i)
      const memberName = memberItem.locator('[data-testid="member-name"]')
      const memberDate = memberItem.locator('[data-testid="member-join-date"]')

      await expect(memberName).toBeVisible()
      await expect(memberDate).toBeVisible()

      // Verify date format (MM/DD/YYYY)
      const dateText = await memberDate.textContent()
      expect(dateText).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
    }
  })

  test('empty squad displays "No members yet" message', async ({ page }) => {
    // Login as a Scrum Master user with an empty squad
    await loginAsUser(page, {
      email: 'scrum-master-empty-squad@example.com',
      name: 'Scrum Master Empty Squad'
    })

    // Navigate to dashboard and squads tab
    await page.goto('/dashboard/scrum-master')
    await page.locator('[data-testid="squads-tab"]').click()

    // Find a squad card
    const squadCard = page.locator('[data-testid="squad-card"]').first()
    await expect(squadCard).toBeVisible()

    // Verify "No members yet" message is displayed
    const emptyMessage = squadCard.locator('[data-testid="squad-no-members"]')
    await expect(emptyMessage).toBeVisible()
    await expect(emptyMessage).toHaveText('No members yet')
  })

  test('large squad with 25 members shows scrollable member list', async ({ page }) => {
    // Login as a Scrum Master user with a large squad
    await loginAsUser(page, {
      email: 'scrum-master-large-squad@example.com',
      name: 'Scrum Master Large Squad'
    })

    // Navigate to dashboard and squads tab
    await page.goto('/dashboard/scrum-master')
    await page.locator('[data-testid="squads-tab"]').click()

    // Find the large squad card
    const squadCard = page.locator('[data-testid="squad-card"]').first()
    await expect(squadCard).toBeVisible()

    // Verify member list is scrollable
    const memberList = squadCard.locator('[data-testid="squad-members-list"]')
    await expect(memberList).toBeVisible()

    // Check for scrollbar or overflow styling
    const overflowStyle = await memberList.evaluate(el => getComputedStyle(el).overflowY)
    expect(['auto', 'scroll']).toContain(overflowStyle)

    // Verify all 25 members are displayed
    const memberItems = memberList.locator('[data-testid="squad-member-item"]')
    await expect(memberItems).toHaveCount(25)
  })

  test('squad cards maintain current visual design', async ({ page }) => {
    // Login as a Scrum Master user with existing squads
    await loginAsUser(page, {
      email: 'scrum-master-with-squads@example.com',
      name: 'Scrum Master With Squads'
    })

    // Navigate to dashboard and squads tab
    await page.goto('/dashboard/scrum-master')
    await page.locator('[data-testid="squads-tab"]').click()

    // Find a squad card
    const squadCard = page.locator('[data-testid="squad-card"]').first()
    await expect(squadCard).toBeVisible()

    // Verify card structure is maintained
    const cardHeader = squadCard.locator('[data-testid="squad-card-header"]')
    const cardTitle = squadCard.locator('[data-testid="squad-card-title"]')
    const cardAlias = squadCard.locator('[data-testid="squad-card-alias"]')
    const cardContent = squadCard.locator('[data-testid="squad-card-content"]')
    const memberCount = squadCard.locator('[data-testid="squad-member-count"]')
    const creationDate = squadCard.locator('[data-testid="squad-creation-date"]')

    // All existing elements should still be present
    await expect(cardHeader).toBeVisible()
    await expect(cardTitle).toBeVisible()
    await expect(cardAlias).toBeVisible()
    await expect(cardContent).toBeVisible()
    await expect(memberCount).toBeVisible()
    await expect(creationDate).toBeVisible()

    // Verify member count still shows correct number
    const memberCountText = await memberCount.textContent()
    expect(memberCountText).toMatch(/\d+ members?/)

    // Verify creation date format is maintained
    const creationDateText = await creationDate.textContent()
    expect(creationDateText).toMatch(/Created \d{1,2}\/\d{1,2}\/\d{4}/)
  })
})