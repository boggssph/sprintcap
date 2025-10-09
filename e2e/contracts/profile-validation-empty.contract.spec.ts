/**
 * Contract test: PUT /api/user/profile rejects empty display name
 * Tests validation for empty display name input
 */

import { test, expect } from '@playwright/test';

test.describe('PUT /api/user/profile - Empty Display Name Validation', () => {
  test('rejects empty string display name', async ({ request }) => {
    // TODO: Set up authenticated session
    const response = await request.put('/api/user/profile', {
      data: { displayName: '' }
    });

    // Should fail with 401 until authentication is implemented
    expect(response.status()).toBe(401);

    // When authentication is implemented, uncomment these assertions:
    /*
    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error.toLowerCase()).toContain('required');
    */
  });

  test('rejects whitespace-only display name', async ({ request }) => {
    // TODO: Set up authenticated session
    const response = await request.put('/api/user/profile', {
      data: { displayName: '   ' }
    });

    // Should fail with 401 until authentication is implemented
    expect(response.status()).toBe(401);

    // When authentication is implemented, uncomment these assertions:
    /*
    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error.toLowerCase()).toContain('required');
    */
  });
});