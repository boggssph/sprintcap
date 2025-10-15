import { test, expect } from '@playwright/test';

test('Invalid input is prevented', async ({ page }) => {
  await page.goto('/dashboard/capacity');

  const memberHoursTable = page.locator('[data-testid="member-hours-table"]');
  const firstRow = memberHoursTable.locator('tbody tr').first();
  const othersCell = firstRow.locator('td').nth(3);

  // Try negative value
  await othersCell.click();
  const input = othersCell.locator('input');
  await input.fill('-1');
  await input.blur();

  // Should show error or revert
  await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  // Or value reverts to previous
  await expect(othersCell).not.toHaveText('-1');
});