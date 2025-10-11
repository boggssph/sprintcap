/**
 * Integration Test: Sprint Creation with New Defaults
 *
 * Tests that newly created sprints use updated ceremony defaults
 * while existing sprints remain unaffected.
 * This test should fail until the implementation is complete.
 */

import { test, expect } from '@playwright/test';

test.describe('Sprint Creation with Updated Ceremony Defaults', () => {
  test('new sprint uses updated ceremony defaults', async ({ page }) => {
    // This test should fail until sprint creation uses ceremony defaults
    await page.goto('/dashboard/squads/test-squad-id');

    // First update ceremony defaults
    await page.click('[data-testid="edit-squad-button"]');
    await page.fill('[data-testid="daily-scrum-minutes-input"]', '25');
    await page.fill('[data-testid="refinement-hours-input"]', '2.0');
    await page.fill('[data-testid="review-demo-minutes-input"]', '60');
    await page.fill('[data-testid="planning-hours-input"]', '2.0');
    await page.fill('[data-testid="retrospective-minutes-input"]', '60');
    await page.click('[data-testid="save-squad-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toContainText('Squad updated successfully');

    // Now create a new sprint
    await page.click('[data-testid="create-sprint-button"]');

    // Fill sprint details for 2 weeks (10 working days)
    await page.fill('[data-testid="sprint-name-input"]', 'Test Sprint with New Defaults');
    await page.fill('[data-testid="sprint-start-date"]', '2025-01-01');
    await page.fill('[data-testid="sprint-end-date"]', '2025-01-14');
    await page.click('[data-testid="create-sprint-submit"]');

    await expect(page.locator('[data-testid="sprint-created-message"]')).toContainText('Sprint created successfully');

    // Verify ceremony calculations use new defaults
    // Daily Scrum: 25 minutes × 10 working days = 250 minutes
    await expect(page.locator('[data-testid="sprint-daily-scrum-total"]')).toContainText('250 minutes');

    // Refinement: 2.0 hours × 2 weeks × 60 = 240 minutes
    await expect(page.locator('[data-testid="sprint-refinement-total"]')).toContainText('240 minutes');

    // Review/Demo: 60 minutes (fixed per sprint)
    await expect(page.locator('[data-testid="sprint-review-demo-total"]')).toContainText('60 minutes');

    // Planning: 2.0 hours × 2 weeks × 60 = 240 minutes
    await expect(page.locator('[data-testid="sprint-planning-total"]')).toContainText('240 minutes');

    // Retrospective: 60 minutes × 2 weeks = 120 minutes
    await expect(page.locator('[data-testid="sprint-retrospective-total"]')).toContainText('120 minutes');
  });

  test('existing sprints retain original ceremony allocations', async ({ page }) => {
    // This test should fail until existing sprint protection is implemented
    // First, create a sprint with original defaults
    await page.goto('/dashboard/squads/test-squad-id');

    await page.click('[data-testid="create-sprint-button"]');
    await page.fill('[data-testid="sprint-name-input"]', 'Original Sprint');
    await page.fill('[data-testid="sprint-start-date"]', '2025-01-01');
    await page.fill('[data-testid="sprint-end-date"]', '2025-01-14');
    await page.click('[data-testid="create-sprint-submit"]');

    await expect(page.locator('[data-testid="sprint-created-message"]')).toContainText('Sprint created successfully');

    // Record original ceremony values (should use defaults: 15min daily, 1hr refinement, etc.)
    const originalDailyScrum = await page.locator('[data-testid="sprint-daily-scrum-total"]').textContent();
    const originalRefinement = await page.locator('[data-testid="sprint-refinement-total"]').textContent();

    // Now update squad ceremony defaults
    await page.goto('/dashboard/squads/test-squad-id');
    await page.click('[data-testid="edit-squad-button"]');
    await page.fill('[data-testid="daily-scrum-minutes-input"]', '30');
    await page.fill('[data-testid="refinement-hours-input"]', '3.0');
    await page.click('[data-testid="save-squad-button"]');

    // Go back to the original sprint
    await page.click('[data-testid="sprint-Original-Sprint-link"]');

    // Verify ceremony values unchanged
    expect(originalDailyScrum).toBeTruthy();
    expect(originalRefinement).toBeTruthy();
    await expect(page.locator('[data-testid="sprint-daily-scrum-total"]')).toContainText(originalDailyScrum!);
    await expect(page.locator('[data-testid="sprint-refinement-total"]')).toContainText(originalRefinement!);
  });

  test('handles partial week calculations correctly', async ({ page }) => {
    // This test should fail until partial week calculations are implemented
    await page.goto('/dashboard/squads/test-squad-id');

    // Set specific defaults
    await page.click('[data-testid="edit-squad-button"]');
    await page.fill('[data-testid="daily-scrum-minutes-input"]', '15');
    await page.fill('[data-testid="refinement-hours-input"]', '1.0');
    await page.fill('[data-testid="planning-hours-input"]', '1.0');
    await page.fill('[data-testid="retrospective-minutes-input"]', '30');
    await page.click('[data-testid="save-squad-button"]');

    // Create sprint for 2.5 weeks (12-13 working days, depending on weekends)
    await page.click('[data-testid="create-sprint-button"]');
    await page.fill('[data-testid="sprint-name-input"]', 'Partial Week Sprint');
    await page.fill('[data-testid="sprint-start-date"]', '2025-01-01'); // Wednesday
    await page.fill('[data-testid="sprint-end-date"]', '2025-01-22'); // 2.5 weeks, Wednesday
    await page.click('[data-testid="create-sprint-submit"]');

    // For 2.5 weeks: ~12-13 working days
    // Daily Scrum: 15 × working days
    // Refinement: 1.0 × 2.5 × 60 = 150 minutes
    await expect(page.locator('[data-testid="sprint-refinement-total"]')).toContainText('150 minutes');

    // Planning: 1.0 × 2.5 × 60 = 150 minutes
    await expect(page.locator('[data-testid="sprint-planning-total"]')).toContainText('150 minutes');

    // Retrospective: 30 × 2.5 = 75 minutes
    await expect(page.locator('[data-testid="sprint-retrospective-total"]')).toContainText('75 minutes');
  });

  test('weekend days are excluded from working day calculations', async ({ page }) => {
    // This test should fail until weekend exclusion is implemented
    await page.goto('/dashboard/squads/test-squad-id');

    await page.click('[data-testid="edit-squad-button"]');
    await page.fill('[data-testid="daily-scrum-minutes-input"]', '10');
    await page.click('[data-testid="save-squad-button"]');

    // Create sprint from Monday to Sunday (1 week, 5 working days)
    await page.click('[data-testid="create-sprint-button"]');
    await page.fill('[data-testid="sprint-name-input"]', 'Full Week Sprint');
    await page.fill('[data-testid="sprint-start-date"]', '2025-01-06'); // Monday
    await page.fill('[data-testid="sprint-end-date"]', '2025-01-12'); // Sunday
    await page.click('[data-testid="create-sprint-submit"]');

    // Should be exactly 5 working days (Mon-Fri)
    // Daily Scrum: 10 × 5 = 50 minutes
    await expect(page.locator('[data-testid="sprint-daily-scrum-total"]')).toContainText('50 minutes');
  });

  test('sprint creation shows ceremony breakdown', async ({ page }) => {
    // This test should fail until ceremony breakdown display is implemented
    await page.goto('/dashboard/squads/test-squad-id');

    await page.click('[data-testid="create-sprint-button"]');

    // Should show ceremony calculation preview before creation
    await expect(page.locator('[data-testid="ceremony-calculation-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-daily-scrum"]')).toContainText('Daily Scrum');
    await expect(page.locator('[data-testid="preview-refinement"]')).toContainText('Refinement');
    await expect(page.locator('[data-testid="preview-review-demo"]')).toContainText('Review & Demo');
    await expect(page.locator('[data-testid="preview-planning"]')).toContainText('Sprint Planning');
    await expect(page.locator('[data-testid="preview-retrospective"]')).toContainText('Retrospective');
  });

  test('can modify ceremony defaults after sprint creation', async ({ page }) => {
    // This test should fail until post-creation default modification is implemented
    await page.goto('/dashboard/squads/test-squad-id');

    // Create sprint with current defaults
    await page.click('[data-testid="create-sprint-button"]');
    await page.fill('[data-testid="sprint-name-input"]', 'Modifiable Sprint');
    await page.fill('[data-testid="sprint-start-date"]', '2025-01-01');
    await page.fill('[data-testid="sprint-end-date"]', '2025-01-14');
    await page.click('[data-testid="create-sprint-submit"]');

    // Update defaults after sprint creation
    await page.goto('/dashboard/squads/test-squad-id');
    await page.click('[data-testid="edit-squad-button"]');
    await page.fill('[data-testid="daily-scrum-minutes-input"]', '20');
    await page.click('[data-testid="save-squad-button"]');

    // Create another sprint - should use new defaults
    await page.click('[data-testid="create-sprint-button"]');
    await page.fill('[data-testid="sprint-name-input"]', 'Sprint with New Defaults');
    await page.fill('[data-testid="sprint-start-date"]', '2025-01-15');
    await page.fill('[data-testid="sprint-end-date"]', '2025-01-28');
    await page.click('[data-testid="create-sprint-submit"]');

    // Second sprint should use updated defaults (20 min × 10 days = 200 min)
    await expect(page.locator('[data-testid="sprint-daily-scrum-total"]')).toContainText('200 minutes');

    // First sprint should be unaffected
    await page.click('[data-testid="sprint-Modifiable-Sprint-link"]');
    await expect(page.locator('[data-testid="sprint-daily-scrum-total"]')).not.toContainText('200 minutes');
  });
});