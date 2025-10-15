import { test, expect } from '@playwright/test';

test('Decimal precision is accepted', async ({ page }) => {
  await page.goto('/dashboard/capacity');

  const memberHoursTable = page.locator('[data-testid="member-hours-table"]');
  const firstRow = memberHoursTable.locator('tbody tr').first();
  const supportIncidentsCell = firstRow.locator('td').nth(1);

  await supportIncidentsCell.click();
  const input = supportIncidentsCell.locator('input');
  await input.fill('2.55');
  await input.blur();

  await expect(supportIncidentsCell).toHaveText('2.55');

  // Refresh and verify
  await page.reload();
  const refreshedCell = memberHoursTable.locator('tbody tr').first().locator('td').nth(1);
  await expect(refreshedCell).toHaveText('2.55');
});