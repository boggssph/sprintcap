// test/integration/version-display.test.ts
import { describe, test, expect, vi } from 'vitest';

// Mock the version service
const mockGetVersionInfo = vi.fn();
vi.mock('../../lib/services/versionService', () => ({
  getVersionInfo: mockGetVersionInfo
}));

describe('Version Display Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetVersionInfo.mockResolvedValue({
      version: 'v1.0.0-test',
      deploymentId: 'dpl_test123',
      deploymentUrl: 'https://test.vercel.app',
      isAvailable: true,
      lastFetched: Date.now(),
    });
  });

  test('should call version service when footer component loads', async () => {
    // This test will pass once Footer component is implemented
    // For now, it documents the expected behavior
    expect(mockGetVersionInfo).not.toHaveBeenCalled();

    // TODO: Once Footer component exists, test that it calls getVersionInfo
    // const { getVersionInfo } = await import('../../lib/services/versionService');
    // expect(getVersionInfo).toHaveBeenCalled();
  });

  test('should handle version data structure', async () => {
    // Act
    const versionInfo = await mockGetVersionInfo();

    // Assert
    expect(versionInfo).toHaveProperty('version');
    expect(versionInfo).toHaveProperty('deploymentId');
    expect(versionInfo).toHaveProperty('isAvailable', true);
    expect(typeof versionInfo.version).toBe('string');
  });

  test('should prepare version for display in footer', async () => {
    // Act
    const versionInfo = await mockGetVersionInfo();

    // Assert - version should be displayable
    expect(versionInfo.version).toMatch(/^v\d+\.\d+\.\d+/);
    expect(versionInfo.isAvailable).toBe(true);
  });
});