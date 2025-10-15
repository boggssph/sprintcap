import { test, expect } from '@playwright/test';

test('Blank input is treated as zero', async ({ page }) => {
  await page.goto('/dashboard/capacity');

  const memberHoursTable = page.locator('[data-testid="member-hours-table"]');
  const firstRow = memberHoursTable.locator('tbody tr').first();
  const prReviewCell = firstRow.locator('td').nth(2);

  // Assume cell has a value, clear it
  await prReviewCell.click();
  const input = prReviewCell.locator('input');
  await input.fill('');
  await input.blur();

  // Should show 0 or be empty treated as 0
  await expect(prReviewCell).toHaveText('0');

  // Refresh and verify
  await page.reload();
  const refreshedCell = memberHoursTable.locator('tbody tr').first().locator('td').nth(2);
  await expect(refreshedCell).toHaveText('0');
});