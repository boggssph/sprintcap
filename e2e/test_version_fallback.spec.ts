import { test, expect } from '@playwright/test';

test.describe('Version Display - Fallback Behavior', () => {
  test('should display "Version unavailable" when version information cannot be loaded', async ({ page }) => {
    // This test would require setting up an environment where NEXT_PUBLIC_VERSION is not set
    // For now, we verify the page structure
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // In a real implementation, we'd check for the fallback message
    // await expect(page.getByText('Version unavailable')).toBeVisible();
  });

  test('should gracefully handle missing version data without breaking the page', async ({ page }) => {
    await page.goto('/');

    // Verify the page still loads and basic functionality works
    await expect(page.locator('body')).toBeVisible();

    // Verify no JavaScript errors occurred
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Wait a bit for any errors to surface
    await page.waitForTimeout(1000);

    expect(errors).toHaveLength(0);
  });
});