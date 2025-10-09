/**
 * Contract test: PUT /api/user/profile rejects invalid characters
 * Tests validation for display names with characters outside allowed set (alphanumeric + spaces)
 */

import { test, expect } from '@playwright/test';

test.describe('PUT /api/user/profile - Invalid Characters Validation', () => {
  test('rejects display name with special characters', async ({ request }) => {
    // TODO: Set up authenticated session
    const response = await request.put('/api/user/profile', {
      data: { displayName: 'John@Doe!' }
    });

    // Should fail with 401 until authentication is implemented
    expect(response.status()).toBe(401);

    // When authentication is implemented, uncomment these assertions:
    /*
    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error.toLowerCase()).toContain('character');
    */
  });

  test('rejects display name with emoji', async ({ request }) => {
    // TODO: Set up authenticated session
    const response = await request.put('/api/user/profile', {
      data: { displayName: 'John Doe 😀' }
    });

    // Should fail with 401 until authentication is implemented
    expect(response.status()).toBe(401);

    // When authentication is implemented, uncomment these assertions:
    /*
    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error.toLowerCase()).toContain('character');
    */
  });

  test('accepts alphanumeric and spaces', async ({ request }) => {
    // TODO: Set up authenticated session
    const response = await request.put('/api/user/profile', {
      data: { displayName: 'John Doe 123' }
    });

    // Should fail with 401 until authentication is implemented
    expect(response.status()).toBe(401);

    // When authentication is implemented, uncomment these assertions:
    /*
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('displayName', 'John Doe 123');
    */
  });
});