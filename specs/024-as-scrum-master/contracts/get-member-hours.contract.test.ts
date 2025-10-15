import { describe, it, expect } from 'vitest';

describe('GET /api/member-hours', () => {
  it('should return member hours for a valid sprint', async () => {
    // Contract test - asserts response schema
    // This test will fail until implementation exists
    const response = await fetch('/api/member-hours?sprintId=test-sprint');
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);

    if (data.length > 0) {
      const item = data[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('memberId');
      expect(item).toHaveProperty('sprintId');
      expect(item).toHaveProperty('memberName');
      expect(item).toHaveProperty('supportIncidents');
      expect(item).toHaveProperty('prReview');
      expect(item).toHaveProperty('others');
      expect(typeof item.supportIncidents).toBe('number');
      expect(typeof item.prReview).toBe('number');
      expect(typeof item.others).toBe('number');
      expect(item.supportIncidents).toBeGreaterThanOrEqual(0);
      expect(item.prReview).toBeGreaterThanOrEqual(0);
      expect(item.others).toBeGreaterThanOrEqual(0);
    }
  });

  it('should return 400 for missing sprintId', async () => {
    const response = await fetch('/api/member-hours');
    expect(response.status).toBe(400);
  });

  it('should return 401 for unauthorized request', async () => {
    const response = await fetch('/api/member-hours?sprintId=test-sprint');
    // Without auth header, should fail
    expect([401, 403]).toContain(response.status);
  });
});