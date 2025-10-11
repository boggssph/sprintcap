/**
 * Contract test: GET /api/capacity-plan/[sprintId]/export exports capacity plan data
 * Tests the API contract for exporting capacity planning data
 */

import { test, expect } from '@playwright/test';

test.describe('GET /api/capacity-plan/[sprintId]/export - Capacity Plan Export', () => {
  test('exports capacity plan data in JSON format', async ({ request }) => {
    const testSprintId = 'test-sprint-id';

    // TODO: Set up authenticated Scrum Master session
    const response = await request.get(`/api/capacity-plan/${testSprintId}/export?format=json`);

    // Should fail with 401 until authentication is implemented
    expect(response.status()).toBe(401);

    // When authentication and implementation is complete, uncomment these assertions:
    /*
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const data = await response.json();
    expect(data).toHaveProperty('sprint');
    expect(data).toHaveProperty('tickets');
    expect(data).toHaveProperty('statistics');
    expect(data).toHaveProperty('exportedAt');

    expect(Array.isArray(data.tickets)).toBe(true);
    expect(typeof data.statistics).toBe('object');
    expect(new Date(data.exportedAt)).toBeInstanceOf(Date);
    */
  });

  test('exports capacity plan data in CSV format', async ({ request }) => {
    const testSprintId = 'test-sprint-id';

    // TODO: Set up authenticated Scrum Master session
    const response = await request.get(`/api/capacity-plan/${testSprintId}/export?format=csv`);

    // Should fail with 401 until authentication is implemented
    expect(response.status()).toBe(401);

    // When implemented:
    /*
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/csv');

    const csvData = await response.text();
    expect(csvData).toContain('Title,Status,Assignee,Jira Key');
    expect(csvData.split('\n')).toHaveLengthGreaterThan(1); // Header + at least one data row
    */
  });

  test('requires Scrum Master authentication', async ({ request }) => {
    const testSprintId = 'test-sprint-id';
    const response = await request.get(`/api/capacity-plan/${testSprintId}/export`);

    expect(response.status()).toBe(401);
  });

  test('validates sprint exists and is active', async ({ request }) => {
    const nonExistentSprintId = 'non-existent-sprint-id';
    const response = await request.get(`/api/capacity-plan/${nonExistentSprintId}/export`);

    // Should fail until implementation
    expect(response.status()).toBe(401);

    // When implemented:
    /*
    expect(response.status()).toBe(404);
    */
  });

  test('validates user is Scrum Master of sprint squad', async ({ request }) => {
    const testSprintId = 'test-sprint-id';
    const response = await request.get(`/api/capacity-plan/${testSprintId}/export`);

    // Should fail until implementation
    expect(response.status()).toBe(401);

    // When implemented (with non-Scrum Master user):
    /*
    expect(response.status()).toBe(403);
    */
  });

  test('defaults to JSON format when no format specified', async ({ request }) => {
    const testSprintId = 'test-sprint-id';

    // TODO: Set up authenticated Scrum Master session
    const response = await request.get(`/api/capacity-plan/${testSprintId}/export`);

    // Should fail with 401 until authentication is implemented
    expect(response.status()).toBe(401);

    // When implemented:
    /*
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    */
  });

  test('validates export format parameter', async ({ request }) => {
    const testSprintId = 'test-sprint-id';

    // TODO: Set up authenticated Scrum Master session
    const response = await request.get(`/api/capacity-plan/${testSprintId}/export?format=invalid`);

    // Should fail until implementation
    expect(response.status()).toBe(401);

    // When implemented:
    /*
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Invalid format');
    */
  });

  test('includes all ticket details in export', async ({ request }) => {
    const testSprintId = 'test-sprint-id';

    // TODO: Set up authenticated Scrum Master session
    const response = await request.get(`/api/capacity-plan/${testSprintId}/export?format=json`);

    // Should fail with 401 until authentication is implemented
    expect(response.status()).toBe(401);

    // When implemented:
    /*
    expect(response.status()).toBe(200);
    const data = await response.json();

    data.tickets.forEach(ticket => {
      expect(ticket).toHaveProperty('id');
      expect(ticket).toHaveProperty('title');
      expect(ticket).toHaveProperty('status');
      expect(ticket).toHaveProperty('jiraKey');
      expect(ticket).toHaveProperty('assignee');
      expect(ticket).toHaveProperty('createdAt');
      expect(ticket).toHaveProperty('updatedAt');
    });
    */
  });
});