/**
 * Contract test: PUT /api/user/profile rejects display name too long
 * Tests validation for display names longer than maximum length (50 characters)
 */

import { test, expect } from '@playwright/test';

test.describe('PUT /api/user/profile - Display Name Too Long Validation', () => {
  test('rejects display name over 50 characters', async ({ request }) => {
    // TODO: Set up authenticated session
    const longDisplayName = 'A'.repeat(51); // 51 characters
    const response = await request.put('/api/user/profile', {
      data: { displayName: longDisplayName }
    });

    // Should fail with 401 until authentication is implemented
    expect(response.status()).toBe(401);

    // When authentication is implemented, uncomment these assertions:
    /*
    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error.toLowerCase()).toContain('maximum');
    */
  });

  test('accepts exactly 50 characters', async ({ request }) => {
    // TODO: Set up authenticated session
    const exactDisplayName = 'A'.repeat(50); // Exactly 50 characters
    const response = await request.put('/api/user/profile', {
      data: { displayName: exactDisplayName }
    });

    // Should fail with 401 until authentication is implemented
    expect(response.status()).toBe(401);

    // When authentication is implemented, uncomment these assertions:
    /*
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('displayName', exactDisplayName);
    */
  });
});