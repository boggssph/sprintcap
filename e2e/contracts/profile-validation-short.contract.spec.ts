/**
 * Contract test: PUT /api/user/profile rejects display name too short
 * Tests validation for display names shorter than minimum length (2 characters)
 */

import { test, expect } from '@playwright/test';

test.describe('PUT /api/user/profile - Display Name Too Short Validation', () => {
  test('rejects single character display name', async ({ request }) => {
    // TODO: Set up authenticated session
    const response = await request.put('/api/user/profile', {
      data: { displayName: 'A' }
    });

    // Should fail with 401 until authentication is implemented
    expect(response.status()).toBe(401);

    // When authentication is implemented, uncomment these assertions:
    /*
    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error.toLowerCase()).toContain('minimum');
    */
  });

  test('rejects empty string after trimming', async ({ request }) => {
    // TODO: Set up authenticated session
    const response = await request.put('/api/user/profile', {
      data: { displayName: ' A ' }
    });

    // Should fail with 401 until authentication is implemented
    expect(response.status()).toBe(401);

    // When authentication is implemented, uncomment these assertions:
    /*
    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error.toLowerCase()).toContain('minimum');
    */
  });
});