import { test, expect } from '@playwright/test';

test('Valid input auto-saves on blur', async ({ page }) => {
  await page.goto('/dashboard/capacity');

  const memberHoursTable = page.locator('[data-testid="member-hours-table"]');
  const firstRow = memberHoursTable.locator('tbody tr').first();
  const supportIncidentsCell = firstRow.locator('td').nth(1);

  // Click to edit
  await supportIncidentsCell.click();
  const input = supportIncidentsCell.locator('input');
  await expect(input).toBeVisible();

  // Enter valid value
  await input.fill('2.5');
  await input.blur(); // Trigger save

  // Check value persists (assuming no error)
  await expect(supportIncidentsCell).toHaveText('2.5');

  // Refresh page and check value is saved
  await page.reload();
  const refreshedCell = memberHoursTable.locator('tbody tr').first().locator('td').nth(1);
  await expect(refreshedCell).toHaveText('2.5');
});