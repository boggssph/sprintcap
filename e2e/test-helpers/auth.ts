/**
 * Authentication helpers for E2E tests
 * Provides utilities for authenticating users in Playwright tests
 */

import { Page } from '@playwright/test';

/**
 * Authenticates a user using the dev credentials provider
 * Only works in development/test environments
 */
export async function loginAsUser(
  page: Page,
  options: {
    email?: string;
    name?: string;
    displayName?: string;
  } = {}
): Promise<void> {
  const { email = 'test@example.com', name = 'Test User', displayName } = options;

  // Navigate to the app
  await page.goto('/');

  // Check if we need to authenticate
  // In development, there should be a "Dev Sign-in" button
  const signInButton = page.locator('button:has-text("Dev Sign-in")').or(
    page.locator('a:has-text("Dev Sign-in")')
  );

  if (await signInButton.isVisible()) {
    await signInButton.click();

    // Fill in the credentials form
    await page.locator('input[name="email"]').fill(email);
    if (name) {
      await page.locator('input[name="name"]').fill(name);
    }

    // Submit the form
    await page.locator('button[type="submit"]').or(
      page.locator('input[type="submit"]')
    ).click();

    // Wait for authentication to complete
    await page.waitForURL(/^(?!.*\/auth)/); // Wait until we're not on an auth page
  }

  // If display name is provided, update it
  if (displayName) {
    await updateDisplayName(page, displayName);
  }
}

/**
 * Updates the display name for the current user
 */
export async function updateDisplayName(page: Page, displayName: string): Promise<void> {
  // Click the pencil icon to edit display name
  await page.locator('[data-testid="edit-display-name"]').click();

  // Fill in the display name
  await page.locator('[data-testid="display-name-input"]').fill(displayName);

  // Save the changes
  await page.locator('[data-testid="save-display-name"]').click();

  // Wait for the dialog to close
  await page.locator('[data-testid="display-name-dialog"]').waitFor({ state: 'hidden' });
}

/**
 * Logs out the current user
 */
export async function logout(page: Page): Promise<void> {
  await page.locator('button:has-text("Sign Out")').or(
    page.locator('a:has-text("Sign Out")')
  ).click();
}

/**
 * Creates a test user with specific properties for testing
 * Note: Currently assumes test users are created via database seeding
 */
export async function createTestUser(): Promise<void> {
  // This would typically call an API endpoint to create a test user
  // For now, we'll assume the test user is created via database seeding
  // or the existing setupTestUser.ts handles this
  // TODO: Implement actual test user creation if needed
}

/**
 * Helper to wait for authentication state
 */
export async function waitForAuthenticated(page: Page): Promise<void> {
  // Wait for an element that indicates the user is authenticated
  await page.locator('[data-testid="user-avatar"]').or(
    page.locator('[data-testid="user-display-name"]')
  ).waitFor({ timeout: 10000 });
}

/**
 * Helper to wait for unauthenticated state
 */
export async function waitForUnauthenticated(page: Page): Promise<void> {
  // Wait for sign-in elements to appear
  await page.locator('button:has-text("Dev Sign-in")').or(
    page.locator('a:has-text("Dev Sign-in")')
  ).waitFor({ timeout: 5000 });
}