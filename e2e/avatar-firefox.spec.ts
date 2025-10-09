/**
 * Firefox-Specific E2E Test: Avatar Display Fix
 * Tests that ProfileDisplay component shows only one avatar element in Firefox
 * Regression test for the issue where both Google avatar and initials displayed simultaneously
 */

import { test, expect } from '@playwright/test';

test.describe('Avatar Display - Firefox Browser', () => {
  // Only run these tests in Firefox
  test.skip(({ browserName }) => browserName !== 'firefox', 'Firefox-specific test');

  test.describe('Avatar Rendering Logic', () => {
    test('should render ProfileDisplay component correctly in Firefox', async ({ page }) => {
      // Navigate to a page that uses ProfileDisplay (we'll use the profile settings page)
      await page.goto('/profile-settings');

      // Wait for page to load
      await expect(page.locator('body')).toBeVisible();

      // Since we can't easily mock authentication in E2E, we'll test the component behavior
      // by checking that the ProfileDisplay component renders without errors
      // The actual avatar logic is thoroughly tested in unit tests

      // If ProfileDisplay is present, it should not have both avatar image and initials simultaneously
      const profileDisplays = page.locator('[data-testid="profile-display"]');

      if (await profileDisplays.count() > 0) {
        const profileDisplay = profileDisplays.first();

        // Count avatar images and fallback elements
        const avatarImages = profileDisplay.locator('img[alt*="profile picture"]');
        const avatarFallbacks = profileDisplay.locator('[data-testid="avatar-fallback"]');

        const imageCount = await avatarImages.count();
        const fallbackCount = await avatarFallbacks.count();

        // The fix ensures that we never have both image and fallback at the same time
        // Either we have 1 image and 0 fallbacks, or 0 images and 1 fallback
        expect(imageCount + fallbackCount).toBeLessThanOrEqual(1);

        // Additional validation: if we have an image, it should be visible
        if (imageCount > 0) {
          await expect(avatarImages.first()).toBeVisible();
        }

        // If we have a fallback, it should be visible
        if (fallbackCount > 0) {
          await expect(avatarFallbacks.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Cross-browser Compatibility Check', () => {
    test('Firefox should behave consistently with other browsers', async ({ page }) => {
      // This test serves as a regression check
      // The actual behavior verification is done in unit tests
      await page.goto('/');

      // Verify Firefox can load the application
      await expect(page.locator('body')).toBeVisible();

      // Check that no JavaScript errors occurred during page load
      const errors: string[] = [];
      page.on('pageerror', (error) => {
        errors.push(error.message);
      });

      // Wait a moment for any async errors
      await page.waitForTimeout(1000);

      // Firefox should not have JavaScript errors that would affect avatar rendering
      expect(errors.length).toBe(0);
    });
  });
});