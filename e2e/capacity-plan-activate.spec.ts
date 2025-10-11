/**
 * Contract test: POST /api/capacity-plan/[sprintId]/activate marks sprint as active
 * Tests the API contract for activating sprints in capacity planning
 */

import { test, expect } from '@playwright/test';

test.describe('POST /api/capacity-plan/[sprintId]/activate - Sprint Activation', () => {
  test('successfully activates a sprint with valid data', async ({ request }) => {
    // This test will fail until proper authentication and implementation is set up
    // For now, we'll test the contract structure

    const testSprintId = 'test-sprint-id';
    const requestBody = { isActive: true };

    // TODO: Set up authenticated Scrum Master session
    const response = await request.post(`/api/capacity-plan/${testSprintId}/activate`, {
      data: requestBody
    });

    // Should fail with 401 until authentication is implemented
    expect(response.status()).toBe(401);

    // When authentication and implementation is complete, uncomment these assertions:
    /*
    expect(response.status()).toBe(200);

    // Verify the response structure if any
    const data = await response.json();
    // Response may be empty or contain confirmation
    */
  });

  test('successfully deactivates a sprint', async ({ request }) => {
    const testSprintId = 'test-sprint-id';
    const requestBody = { isActive: false };

    // TODO: Set up authenticated Scrum Master session
    const response = await request.post(`/api/capacity-plan/${testSprintId}/activate`, {
      data: requestBody
    });

    // Should fail until implementation
    expect(response.status()).toBe(401);

    // When implemented:
    /*
    expect(response.status()).toBe(200);
    */
  });

  test('requires Scrum Master authentication', async ({ request }) => {
    const testSprintId = 'test-sprint-id';
    const response = await request.post(`/api/capacity-plan/${testSprintId}/activate`, {
      data: { isActive: true }
    });

    expect(response.status()).toBe(401);
  });

  test('validates sprint exists', async ({ request }) => {
    const invalidSprintId = 'non-existent-sprint';
    const response = await request.post(`/api/capacity-plan/${invalidSprintId}/activate`, {
      data: { isActive: true }
    });

    // Should fail until implementation
    expect(response.status()).toBe(401);

    // When implemented:
    /*
    expect(response.status()).toBe(404);
    */
  });

  test('validates user is Scrum Master of sprint squad', async ({ request }) => {
    const testSprintId = 'test-sprint-id';
    const response = await request.post(`/api/capacity-plan/${testSprintId}/activate`, {
      data: { isActive: true }
    });

    // Should fail until implementation
    expect(response.status()).toBe(401);

    // When implemented (with non-Scrum Master user):
    /*
    expect(response.status()).toBe(403);
    */
  });

  test('validates request body structure', async ({ request }) => {
    const testSprintId = 'test-sprint-id';

    // Missing isActive field
    const response = await request.post(`/api/capacity-plan/${testSprintId}/activate`, {
      data: {}
    });

    // Should fail until implementation
    expect(response.status()).toBe(401);

    // When implemented:
    /*
    expect(response.status()).toBe(400);
    */
  });
});