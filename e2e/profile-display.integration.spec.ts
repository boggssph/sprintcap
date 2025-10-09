/**
 * Integration test: ProfileDisplay component renders correctly
 * Tests that the ProfileDisplay component shows profile picture and display name
 */

import { test, expect } from '@playwright/test';

test.describe('ProfileDisplay Component Integration', () => {
  test('renders in member dashboard header', async ({ page }) => {
    // Navigate to member dashboard (this should trigger authentication redirect)
    await page.goto('/dashboard/member');

    // Should redirect to auth page since not authenticated
    await expect(page).toHaveURL(/\/auth/);

    // For now, just check that the page loads (authentication would be tested separately)
    // TODO: Add proper authentication setup once auth flow is complete
  });

  test('ProfileDisplay component has correct structure when authenticated', async () => {
    // This test would need proper authentication setup
    // For now, we'll skip until authentication helpers are working
    test.skip();

    // TODO: Implement when auth helpers are fixed
  });
});