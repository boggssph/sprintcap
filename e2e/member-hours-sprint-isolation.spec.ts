import { test, expect } from '@playwright/test';

test('Sprint isolation prevents cross-sprint changes', async ({ page }) => {
  // Assume two sprints exist
  await page.goto('/dashboard/capacity?sprintId=sprint1');

  const table1 = page.locator('[data-testid="member-hours-table"]');
  const cell1 = table1.locator('tbody tr').first().locator('td').nth(1);
  await cell1.click();
  const input1 = cell1.locator('input');
  await input1.fill('3.0');
  await input1.blur();

  // Switch to another sprint
  await page.goto('/dashboard/capacity?sprintId=sprint2');

  const table2 = page.locator('[data-testid="member-hours-table"]');
  const cell2 = table2.locator('tbody tr').first().locator('td').nth(1);
  await expect(cell2).not.toHaveText('3.0'); // Different sprint, different data
});