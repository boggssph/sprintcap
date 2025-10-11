/**
 * Integration Test: Update Squad Name and Alias
 *
 * Tests the complete user journey for updating squad name and alias.
 * This test should fail until the implementation is complete.
 */

import { test, expect } from '@playwright/test';

test.describe('Squad Name and Alias Update', () => {
  test('allows Scrum Master to update squad name', async ({ page }) => {
    // This test should fail until implementation is complete
    await page.goto('/dashboard/squads/test-squad-id');

    // Should show edit button (will fail until implemented)
    await expect(page.locator('[data-testid="edit-squad-button"]')).toBeVisible();

    // Should show squad name input (will fail until implemented)
    await page.click('[data-testid="edit-squad-button"]');
    await expect(page.locator('[data-testid="squad-name-input"]')).toBeVisible();

    // Should allow updating name (will fail until API implemented)
    await page.fill('[data-testid="squad-name-input"]', 'Updated Squad Name');
    await page.click('[data-testid="save-squad-button"]');

    // Should show success message (will fail until implemented)
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Squad updated successfully');
  });

  test('allows Scrum Master to update squad alias', async ({ page }) => {
    // This test should fail until implementation is complete
    await page.goto('/dashboard/squads/test-squad-id');

    await page.click('[data-testid="edit-squad-button"]');
    await expect(page.locator('[data-testid="squad-alias-input"]')).toBeVisible();

    await page.fill('[data-testid="squad-alias-input"]', 'updated-alias');
    await page.click('[data-testid="save-squad-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toContainText('Squad updated successfully');
  });

  test('enforces name uniqueness within organization', async ({ page }) => {
    // This test should fail until validation is implemented
    await page.goto('/dashboard/squads/test-squad-id');

    await page.click('[data-testid="edit-squad-button"]');
    await page.fill('[data-testid="squad-name-input"]', 'Existing Squad Name');
    await page.click('[data-testid="save-squad-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toContainText('Name already exists in organization');
  });

  test('enforces alias uniqueness globally', async ({ page }) => {
    // This test should fail until validation is implemented
    await page.goto('/dashboard/squads/test-squad-id');

    await page.click('[data-testid="edit-squad-button"]');
    await page.fill('[data-testid="squad-alias-input"]', 'existing-alias');
    await page.click('[data-testid="save-squad-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toContainText('Alias already exists');
  });

  test('validates name cannot be empty', async ({ page }) => {
    // This test should fail until validation is implemented
    await page.goto('/dashboard/squads/test-squad-id');

    await page.click('[data-testid="edit-squad-button"]');
    await page.fill('[data-testid="squad-name-input"]', '');
    await page.click('[data-testid="save-squad-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toContainText('Name cannot be empty');
  });

  test('validates alias format', async ({ page }) => {
    // This test should fail until validation is implemented
    await page.goto('/dashboard/squads/test-squad-id');

    await page.click('[data-testid="edit-squad-button"]');
    await page.fill('[data-testid="squad-alias-input"]', 'Invalid Alias!');
    await page.click('[data-testid="save-squad-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toContainText('Alias must contain only lowercase letters, numbers, and hyphens');
  });

  test('requires Scrum Master role', async ({ page }) => {
    // This test should fail until authorization is implemented
    await page.goto('/dashboard/squads/test-squad-id');

    // As a regular member, should not see edit button
    await expect(page.locator('[data-testid="edit-squad-button"]')).not.toBeVisible();
  });
});