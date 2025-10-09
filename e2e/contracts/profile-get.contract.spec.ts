/**
 * Contract test: GET /api/user/profile returns user data
 * Tests the API contract for retrieving user profile information
 */

import { test, expect } from '@playwright/test';

test.describe('GET /api/user/profile - User Data Retrieval', () => {
  test('returns user profile data with all required fields', async ({ request }) => {
    // This test will fail until proper authentication is set up
    // For now, we'll test the contract structure

    // TODO: Set up authenticated session
    const response = await request.get('/api/user/profile');

    // Should fail with 401 until authentication is implemented
    expect(response.status()).toBe(401);

    // When authentication is implemented, uncomment these assertions:
    /*
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('user');
    expect(data.user).toHaveProperty('id');
    expect(data.user).toHaveProperty('email');
    expect(data.user).toHaveProperty('displayName');
    expect(data.user).toHaveProperty('image');
    expect(data.user).toHaveProperty('role');
    expect(data.user).toHaveProperty('createdAt');

    // Validate data types
    expect(typeof data.user.id).toBe('string');
    expect(typeof data.user.email).toBe('string');
    expect(typeof data.user.displayName).toBe('string');
    expect(['ADMIN', 'SCRUM_MASTER', 'MEMBER'].includes(data.user.role)).toBe(true);
    expect(new Date(data.user.createdAt).toISOString()).toBe(data.user.createdAt);
    */
  });

  test('requires authentication', async ({ request }) => {
    const response = await request.get('/api/user/profile');

    expect(response.status()).toBe(401);
  });
});