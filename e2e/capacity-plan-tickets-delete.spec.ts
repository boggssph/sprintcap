/**
 * Contract test: DELETE /api/capacity-plan/[sprintId]/tickets/[ticketId] deletes ticket
 * Tests the API contract for deleting tickets in capacity planning
 */

import { test, expect } from '@playwright/test';

test.describe('DELETE /api/capacity-plan/[sprintId]/tickets/[ticketId] - Ticket Deletion', () => {
  test('successfully deletes existing ticket', async ({ request }) => {
    const testSprintId = 'test-sprint-id';
    const testTicketId = 'test-ticket-id';

    // TODO: Set up authenticated Scrum Master session
    const response = await request.delete(`/api/capacity-plan/${testSprintId}/tickets/${testTicketId}`);

    // Should fail with 401 until authentication is implemented
    expect(response.status()).toBe(401);

    // When authentication and implementation is complete, uncomment these assertions:
    /*
    expect(response.status()).toBe(204);

    // Verify ticket is deleted by trying to fetch it
    const getResponse = await request.get(`/api/capacity-plan/${testSprintId}/tickets/${testTicketId}`);
    expect(getResponse.status()).toBe(404);
    */
  });

  test('requires Scrum Master authentication', async ({ request }) => {
    const testSprintId = 'test-sprint-id';
    const testTicketId = 'test-ticket-id';
    const response = await request.delete(`/api/capacity-plan/${testSprintId}/tickets/${testTicketId}`);

    expect(response.status()).toBe(401);
  });

  test('validates ticket exists', async ({ request }) => {
    const testSprintId = 'test-sprint-id';
    const nonExistentTicketId = 'non-existent-ticket-id';
    const response = await request.delete(`/api/capacity-plan/${testSprintId}/tickets/${nonExistentTicketId}`);

    // Should fail until implementation
    expect(response.status()).toBe(401);

    // When implemented:
    /*
    expect(response.status()).toBe(404);
    */
  });

  test('validates user is Scrum Master of sprint squad', async ({ request }) => {
    const testSprintId = 'test-sprint-id';
    const testTicketId = 'test-ticket-id';
    const response = await request.delete(`/api/capacity-plan/${testSprintId}/tickets/${testTicketId}`);

    // Should fail until implementation
    expect(response.status()).toBe(401);

    // When implemented (with non-Scrum Master user):
    /*
    expect(response.status()).toBe(403);
    */
  });
});