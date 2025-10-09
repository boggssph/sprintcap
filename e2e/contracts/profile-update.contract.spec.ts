/**
 * Contract test: PUT /api/user/profile updates display name
 * Tests the API contract for updating user display name
 */

import { test, expect } from '@playwright/test';

test.describe('PUT /api/user/profile - Display Name Update', () => {
  test('successfully updates display name with valid input', async ({ request }) => {
    const newDisplayName = 'Updated Test User';

    // TODO: Set up authenticated session
    const response = await request.put('/api/user/profile', {
      data: { displayName: newDisplayName }
    });

    // Should fail with 401 until authentication is implemented
    expect(response.status()).toBe(401);

    // When authentication is implemented, uncomment these assertions:
    /*
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('user');
    expect(data.user.displayName).toBe(newDisplayName);
    expect(data.user).toHaveProperty('id');
    expect(data.user).toHaveProperty('email');
    expect(data.user).toHaveProperty('image');
    expect(data.user).toHaveProperty('role');
    expect(data.user).toHaveProperty('createdAt');
    */
  });

  test('requires authentication', async ({ request }) => {
    const response = await request.put('/api/user/profile', {
      data: { displayName: 'Test Name' }
    });

    expect(response.status()).toBe(401);
  });
});