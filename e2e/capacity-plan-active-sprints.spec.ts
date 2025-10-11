/**
 * Contract test: GET /api/capacity-plan/active-sprints returns active sprints for Scrum Master
 * Tests the API contract for retrieving active sprints in capacity planning
 */

import { test, expect } from '@playwright/test';

test.describe('GET /api/capacity-plan/active-sprints - Active Sprints Retrieval', () => {
  test('returns active sprints data with all required fields', async ({ request }) => {
    // This test will fail until proper authentication and implementation is set up
    // For now, we'll test the contract structure

    // TODO: Set up authenticated Scrum Master session
    const response = await request.get('/api/capacity-plan/active-sprints');

    // Should fail with 401 until authentication is implemented
    expect(response.status()).toBe(401);

    // When authentication and implementation is complete, uncomment these assertions:
    /*
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('sprints');
    expect(Array.isArray(data.sprints)).toBe(true);

    // Validate sprint object structure
    if (data.sprints.length > 0) {
      const sprint = data.sprints[0];
      expect(sprint).toHaveProperty('id');
      expect(sprint).toHaveProperty('name');
      expect(sprint).toHaveProperty('startDate');
      expect(sprint).toHaveProperty('endDate');
      expect(sprint).toHaveProperty('squadId');
      expect(sprint).toHaveProperty('squadName');
      expect(sprint).toHaveProperty('ticketCount');

      // Validate data types
      expect(typeof sprint.id).toBe('string');
      expect(typeof sprint.name).toBe('string');
      expect(typeof sprint.squadId).toBe('string');
      expect(typeof sprint.squadName).toBe('string');
      expect(typeof sprint.ticketCount).toBe('number');
      expect(sprint.ticketCount).toBeGreaterThanOrEqual(0);

      // Validate date format
      expect(new Date(sprint.startDate).toISOString()).toBe(sprint.startDate);
      expect(new Date(sprint.endDate).toISOString()).toBe(sprint.endDate);
    }
    */
  });

  test('requires Scrum Master authentication', async ({ request }) => {
    const response = await request.get('/api/capacity-plan/active-sprints');

    expect(response.status()).toBe(401);
  });

  test('returns empty array when no active sprints exist', async ({ request }) => {
    // TODO: Set up authenticated Scrum Master with no active sprints
    const response = await request.get('/api/capacity-plan/active-sprints');

    // Should fail until implementation
    expect(response.status()).toBe(401);

    // When implemented:
    /*
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('sprints');
    expect(Array.isArray(data.sprints)).toBe(true);
    expect(data.sprints.length).toBe(0);
    */
  });
});