import { test, expect } from '@playwright/test';

test('Member hours table displays correctly', async ({ page }) => {
  // Navigate to capacity tab (assuming logged in as scrum master)
  await page.goto('/dashboard/capacity');

  // Check that the member hours table exists above tickets
  const memberHoursTable = page.locator('[data-testid="member-hours-table"]');
  await expect(memberHoursTable).toBeVisible();

  // Check table has correct columns
  const headers = memberHoursTable.locator('thead th');
  await expect(headers.nth(0)).toHaveText('Member Name');
  await expect(headers.nth(1)).toHaveText('Support and Incidents');
  await expect(headers.nth(2)).toHaveText('PR Review');
  await expect(headers.nth(3)).toHaveText('Others');

  // Check that member rows exist (at least one)
  const rows = memberHoursTable.locator('tbody tr');
  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThan(0);

  // Check first row has read-only member name
  const firstRow = rows.first();
  const memberNameCell = firstRow.locator('td').first();
  await expect(memberNameCell).not.toHaveAttribute('contenteditable', 'true');
});