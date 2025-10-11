/**
 * Contract test: GET /api/capacity-plan/[sprintId]/tickets returns tickets for sprint
 * Tests the API contract for retrieving tickets in capacity planning
 */

import { test, expect } from '@playwright/test';

test.describe('GET /api/capacity-plan/[sprintId]/tickets - Sprint Tickets Retrieval', () => {
  test('returns tickets data with all required fields', async ({ request }) => {
    const testSprintId = 'test-sprint-id';

    // TODO: Set up authenticated Scrum Master session
    const response = await request.get(`/api/capacity-plan/${testSprintId}/tickets`);

    // Should fail with 401 until authentication is implemented
    expect(response.status()).toBe(401);

    // When authentication and implementation is complete, uncomment these assertions:
    /*
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('tickets');
    expect(Array.isArray(data.tickets)).toBe(true);

    // Validate ticket object structure
    if (data.tickets.length > 0) {
      const ticket = data.tickets[0];
      expect(ticket).toHaveProperty('id');
      expect(ticket).toHaveProperty('title');
      expect(ticket).toHaveProperty('status');
      expect(ticket).toHaveProperty('jiraKey');
      expect(ticket).toHaveProperty('createdAt');

      // Optional fields
      expect(ticket).toHaveProperty('description');
      expect(ticket).toHaveProperty('assignee');

      // Validate data types
      expect(typeof ticket.id).toBe('string');
      expect(typeof ticket.title).toBe('string');
      expect(typeof ticket.status).toBe('string');
      expect(typeof ticket.jiraKey).toBe('string');
      expect(new Date(ticket.createdAt).toISOString()).toBe(ticket.createdAt);
    }
    */
  });

  test('requires Scrum Master authentication', async ({ request }) => {
    const testSprintId = 'test-sprint-id';
    const response = await request.get(`/api/capacity-plan/${testSprintId}/tickets`);

    expect(response.status()).toBe(401);
  });

  test('validates user is Scrum Master of sprint squad', async ({ request }) => {
    const testSprintId = 'test-sprint-id';
    const response = await request.get(`/api/capacity-plan/${testSprintId}/tickets`);

    // Should fail until implementation
    expect(response.status()).toBe(401);

    // When implemented (with non-Scrum Master user):
    /*
    expect(response.status()).toBe(403);
    */
  });
});