/**
 * Integration Test: Configure Ceremony Time Defaults
 *
 * Tests the complete user journey for configuring ceremony time defaults
 * and verifying they are used in sprint calculations.
 * This test should fail until the implementation is complete.
 */

import { test, expect } from '@playwright/test';

test.describe('Squad Ceremony Time Defaults Configuration', () => {
  test('allows Scrum Master to configure Daily Scrum defaults', async ({ page }) => {
    // This test should fail until implementation is complete
    await page.goto('/dashboard/squads/test-squad-id');

    await page.click('[data-testid="edit-squad-button"]');

    // Should show ceremony defaults section (will fail until implemented)
    await expect(page.locator('[data-testid="ceremony-defaults-section"]')).toBeVisible();

    // Configure Daily Scrum minutes
    await page.fill('[data-testid="daily-scrum-minutes-input"]', '20');
    await page.click('[data-testid="save-squad-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toContainText('Squad updated successfully');
  });

  test('allows Scrum Master to configure all ceremony defaults', async ({ page }) => {
    // This test should fail until implementation is complete
    await page.goto('/dashboard/squads/test-squad-id');

    await page.click('[data-testid="edit-squad-button"]');

    // Configure all ceremony defaults
    await page.fill('[data-testid="daily-scrum-minutes-input"]', '20');
    await page.fill('[data-testid="refinement-hours-input"]', '1.5');
    await page.fill('[data-testid="review-demo-minutes-input"]', '45');
    await page.fill('[data-testid="planning-hours-input"]', '1.5');
    await page.fill('[data-testid="retrospective-minutes-input"]', '45');

    await page.click('[data-testid="save-squad-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Squad updated successfully');
  });

  test('validates ceremony time values are positive', async ({ page }) => {
    // This test should fail until validation is implemented
    await page.goto('/dashboard/squads/test-squad-id');

    await page.click('[data-testid="edit-squad-button"]');

    // Try negative value
    await page.fill('[data-testid="daily-scrum-minutes-input"]', '-5');
    await page.click('[data-testid="save-squad-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toContainText('must be greater than 0');
  });

  test('validates ceremony time values are numbers', async ({ page }) => {
    // This test should fail until validation is implemented
    await page.goto('/dashboard/squads/test-squad-id');

    await page.click('[data-testid="edit-squad-button"]');

    // Try invalid input
    await page.fill('[data-testid="refinement-hours-input"]', 'not-a-number');
    await page.click('[data-testid="save-squad-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toContainText('must be a number');
  });

  test('validates integer fields accept only whole numbers', async ({ page }) => {
    // This test should fail until validation is implemented
    await page.goto('/dashboard/squads/test-squad-id');

    await page.click('[data-testid="edit-squad-button"]');

    // Try decimal in integer field
    await page.fill('[data-testid="daily-scrum-minutes-input"]', '15.5');
    await page.click('[data-testid="save-squad-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toContainText('must be a whole number');
  });

  test('allows decimal values for hour fields', async ({ page }) => {
    // This test should fail until implementation accepts decimals
    await page.goto('/dashboard/squads/test-squad-id');

    await page.click('[data-testid="edit-squad-button"]');

    // Decimal hours should be accepted
    await page.fill('[data-testid="refinement-hours-input"]', '1.25');
    await page.fill('[data-testid="planning-hours-input"]', '0.5');

    await page.click('[data-testid="save-squad-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Squad updated successfully');
  });

  test('creates sprint with updated ceremony calculations', async ({ page }) => {
    // This test should fail until sprint creation uses ceremony defaults
    await page.goto('/dashboard/squads/test-squad-id');

    // First update ceremony defaults
    await page.click('[data-testid="edit-squad-button"]');
    await page.fill('[data-testid="daily-scrum-minutes-input"]', '20');
    await page.fill('[data-testid="refinement-hours-input"]', '1.5');
    await page.fill('[data-testid="review-demo-minutes-input"]', '45');
    await page.fill('[data-testid="planning-hours-input"]', '1.5');
    await page.fill('[data-testid="retrospective-minutes-input"]', '45');
    await page.click('[data-testid="save-squad-button"]');

    // Navigate to create sprint
    await page.click('[data-testid="create-sprint-button"]');

    // Create a 2-week sprint (should use 10 working days)
    await page.fill('[data-testid="sprint-name-input"]', 'Test Sprint');
    await page.fill('[data-testid="sprint-start-date"]', '2025-01-01');
    await page.fill('[data-testid="sprint-end-date"]', '2025-01-14'); // 2 weeks
    await page.click('[data-testid="create-sprint-submit"]');

    // Verify ceremony times are calculated correctly
    // Daily Scrum: 20 minutes × 10 working days = 200 minutes
    await expect(page.locator('[data-testid="daily-scrum-total"]')).toContainText('200 minutes');

    // Refinement: 1.5 hours × 2 weeks × 60 = 180 minutes
    await expect(page.locator('[data-testid="refinement-total"]')).toContainText('180 minutes');

    // Review/Demo: 45 minutes (fixed per sprint)
    await expect(page.locator('[data-testid="review-demo-total"]')).toContainText('45 minutes');

    // Planning: 1.5 hours × 2 weeks × 60 = 180 minutes
    await expect(page.locator('[data-testid="planning-total"]')).toContainText('180 minutes');

    // Retrospective: 45 minutes × 2 weeks = 90 minutes
    await expect(page.locator('[data-testid="retrospective-total"]')).toContainText('90 minutes');
  });
});