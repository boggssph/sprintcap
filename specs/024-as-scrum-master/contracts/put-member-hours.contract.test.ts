import { describe, it, expect } from 'vitest';

describe('PUT /api/member-hours', () => {
  it('should update member hours with valid data', async () => {
    const updateData = {
      memberId: 'test-member',
      sprintId: 'test-sprint',
      supportIncidents: 2.5,
      prReview: 1.0,
      others: 0.5
    };

    const response = await fetch('/api/member-hours', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Assume auth header would be added
      },
      body: JSON.stringify(updateData)
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.memberId).toBe(updateData.memberId);
    expect(data.sprintId).toBe(updateData.sprintId);
    expect(data.supportIncidents).toBe(updateData.supportIncidents);
    expect(data.prReview).toBe(updateData.prReview);
    expect(data.others).toBe(updateData.others);
  });

  it('should return 400 for invalid hour values', async () => {
    const invalidData = {
      memberId: 'test-member',
      sprintId: 'test-sprint',
      supportIncidents: -1, // Invalid negative
      prReview: 1.0,
      others: 0.5
    };

    const response = await fetch('/api/member-hours', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData)
    });

    expect(response.status).toBe(400);
  });

  it('should return 404 for non-existent member or sprint', async () => {
    const updateData = {
      memberId: 'non-existent',
      sprintId: 'test-sprint',
      supportIncidents: 1.0,
      prReview: 0,
      others: 0
    };

    const response = await fetch('/api/member-hours', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    expect(response.status).toBe(404);
  });

  it('should return 401 for unauthorized request', async () => {
    const updateData = {
      memberId: 'test-member',
      sprintId: 'test-sprint',
      supportIncidents: 1.0,
      prReview: 0,
      others: 0
    };

    const response = await fetch('/api/member-hours', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    // Without auth, should fail
    expect([401, 403]).toContain(response.status);
  });
});