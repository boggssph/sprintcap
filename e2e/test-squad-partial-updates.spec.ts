/**
 * Integration Test: Partial Updates
 *
 * Tests that squad updates work correctly with partial data,
 * only modifying specified fields while preserving others.
 * This test should fail until the implementation is complete.
 */

import { test, expect } from '@playwright/test';

test.describe('Squad Partial Updates', () => {
  test('allows updating only squad name', async ({ page }) => {
    // This test should fail until partial updates are implemented
    await page.goto('/dashboard/squads/test-squad-id');

    await page.click('[data-testid="edit-squad-button"]');

    // Only change name, leave other fields unchanged
    const originalAlias = await page.locator('[data-testid="squad-alias-input"]').inputValue();
    const originalDailyScrum = await page.locator('[data-testid="daily-scrum-minutes-input"]').inputValue();

    await page.fill('[data-testid="squad-name-input"]', 'Updated Name Only');
    await page.click('[data-testid="save-squad-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toContainText('Squad updated successfully');

    // Verify only name changed
    await expect(page.locator('[data-testid="squad-name-display"]')).toContainText('Updated Name Only');
    await expect(page.locator('[data-testid="squad-alias-display"]')).toContainText(originalAlias);
    await expect(page.locator('[data-testid="daily-scrum-display"]')).toContainText(originalDailyScrum);
  });

  test('allows updating only ceremony defaults', async ({ page }) => {
    // This test should fail until partial updates are implemented
    await page.goto('/dashboard/squads/test-squad-id');

    await page.click('[data-testid="edit-squad-button"]');

    // Only change ceremony fields, leave name/alias unchanged
    const originalName = await page.locator('[data-testid="squad-name-input"]').inputValue();
    const originalAlias = await page.locator('[data-testid="squad-alias-input"]').inputValue();

    await page.fill('[data-testid="daily-scrum-minutes-input"]', '25');
    await page.fill('[data-testid="refinement-hours-input"]', '2.0');
    await page.click('[data-testid="save-squad-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toContainText('Squad updated successfully');

    // Verify only ceremony fields changed
    await expect(page.locator('[data-testid="squad-name-display"]')).toContainText(originalName);
    await expect(page.locator('[data-testid="squad-alias-display"]')).toContainText(originalAlias);
    await expect(page.locator('[data-testid="daily-scrum-display"]')).toContainText('25');
    await expect(page.locator('[data-testid="refinement-hours-display"]')).toContainText('2.0');
  });

  test('allows updating mixed fields', async ({ page }) => {
    // This test should fail until partial updates are implemented
    await page.goto('/dashboard/squads/test-squad-id');

    await page.click('[data-testid="edit-squad-button"]');

    // Change some fields but not others
    await page.fill('[data-testid="squad-name-input"]', 'Mixed Update');
    await page.fill('[data-testid="daily-scrum-minutes-input"]', '30');
    // Leave alias and other ceremony fields unchanged

    const originalAlias = await page.locator('[data-testid="squad-alias-input"]').inputValue();
    const originalRefinement = await page.locator('[data-testid="refinement-hours-input"]').inputValue();

    await page.click('[data-testid="save-squad-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toContainText('Squad updated successfully');

    // Verify correct fields changed
    await expect(page.locator('[data-testid="squad-name-display"]')).toContainText('Mixed Update');
    await expect(page.locator('[data-testid="daily-scrum-display"]')).toContainText('30');
    await expect(page.locator('[data-testid="squad-alias-display"]')).toContainText(originalAlias);
    await expect(page.locator('[data-testid="refinement-hours-display"]')).toContainText(originalRefinement);
  });

  test('preserves default values for untouched ceremony fields', async ({ page }) => {
    // This test should fail until partial updates preserve defaults
    await page.goto('/dashboard/squads/test-squad-id');

    await page.click('[data-testid="edit-squad-button"]');

    // Only update one ceremony field
    await page.fill('[data-testid="daily-scrum-minutes-input"]', '20');
    // Leave all others at defaults

    await page.click('[data-testid="save-squad-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toContainText('Squad updated successfully');

    // Verify updated field changed
    await expect(page.locator('[data-testid="daily-scrum-display"]')).toContainText('20');

    // Verify untouched fields remain at defaults
    await expect(page.locator('[data-testid="refinement-hours-display"]')).toContainText('1.0'); // default
    await expect(page.locator('[data-testid="review-demo-minutes-display"]')).toContainText('30'); // default
    await expect(page.locator('[data-testid="planning-hours-display"]')).toContainText('1.0'); // default
    await expect(page.locator('[data-testid="retrospective-minutes-display"]')).toContainText('30'); // default
  });

  test('handles empty string as no change for optional fields', async ({ page }) => {
    // This test should fail until partial updates handle empty strings correctly
    await page.goto('/dashboard/squads/test-squad-id');

    await page.click('[data-testid="edit-squad-button"]');

    // Set alias to empty string (should be treated as no change)
    await page.fill('[data-testid="squad-alias-input"]', '');
    await page.fill('[data-testid="daily-scrum-minutes-input"]', '18');

    const originalAlias = await page.locator('[data-testid="squad-alias-input"]').getAttribute('placeholder') ||
                         await page.locator('[data-testid="squad-alias-input"]').inputValue();

    await page.click('[data-testid="save-squad-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toContainText('Squad updated successfully');

    // Verify alias unchanged, daily scrum updated
    await expect(page.locator('[data-testid="squad-alias-display"]')).toContainText(originalAlias);
    await expect(page.locator('[data-testid="daily-scrum-display"]')).toContainText('18');
  });

  test('updates timestamp only for changed fields', async ({ page }) => {
    // This test should fail until timestamp handling is implemented
    await page.goto('/dashboard/squads/test-squad-id');

    // Record original timestamp
    const originalTimestamp = await page.locator('[data-testid="last-updated"]').textContent();

    await page.click('[data-testid="edit-squad-button"]');

    // Wait a moment to ensure timestamp would change
    await page.waitForTimeout(1000);

    // Make only a minor change
    await page.fill('[data-testid="daily-scrum-minutes-input"]', '16');
    await page.click('[data-testid="save-squad-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toContainText('Squad updated successfully');

    // Verify timestamp was updated
    const newTimestamp = await page.locator('[data-testid="last-updated"]').textContent();
    expect(newTimestamp).not.toBe(originalTimestamp);
  });

  test('allows cancelling partial changes', async ({ page }) => {
    // This test should fail until cancel functionality is implemented
    await page.goto('/dashboard/squads/test-squad-id');

    await page.click('[data-testid="edit-squad-button"]');

    // Make changes
    await page.fill('[data-testid="squad-name-input"]', 'Changed Name');
    await page.fill('[data-testid="daily-scrum-minutes-input"]', '99');

    // Cancel instead of save
    await page.click('[data-testid="cancel-edit-button"]');

    // Verify changes were not saved
    await expect(page.locator('[data-testid="squad-name-display"]')).not.toContainText('Changed Name');
    await expect(page.locator('[data-testid="daily-scrum-display"]')).not.toContainText('99');
  });

  test('maintains form state during validation errors', async ({ page }) => {
    // This test should fail until form state preservation is implemented
    await page.goto('/dashboard/squads/test-squad-id');

    await page.click('[data-testid="edit-squad-button"]');

    // Make valid partial changes
    await page.fill('[data-testid="squad-name-input"]', 'Valid New Name');
    await page.fill('[data-testid="daily-scrum-minutes-input"]', '22');

    // Add one invalid change
    await page.fill('[data-testid="refinement-hours-input"]', '-5');

    await page.click('[data-testid="save-squad-button"]');

    // Should show error but keep valid changes in form
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="squad-name-input"]')).toHaveValue('Valid New Name');
    await expect(page.locator('[data-testid="daily-scrum-minutes-input"]')).toHaveValue('22');
    await expect(page.locator('[data-testid="refinement-hours-input"]')).toHaveValue('-5'); // Invalid but preserved
  });
});