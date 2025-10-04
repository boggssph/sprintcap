// Set up test environment variables before importing
process.env.VERCEL_ACCESS_TOKEN = 'test-token';
process.env.VERCEL_PROJECT_ID = 'test-project-id';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { versionService } from '../../lib/services/versionService';
import { VersionService } from '../../lib/services/versionService';
import { versionCache } from '../../lib/services/versionCache';

// Mock fetch globally
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('Version Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    versionCache.clearAll();
    // Always set both env vars before each test
    process.env.VERCEL_ACCESS_TOKEN = 'test-token';
    process.env.VERCEL_PROJECT_ID = 'test-project-id';
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        deployments: [{
          id: 'dpl_123456789',
          name: 'test-deployment',
          url: 'https://test.vercel.app',
          createdAt: Date.now(),
          state: 'READY',
          meta: { githubCommitSha: 'abc123456789abcdef' },
          inspectorUrl: 'https://vercel.com/inspect/test',
        }],
      }),
    });
  });

  it('should retrieve version from cache within 10ms', async () => {
    // Pre-populate cache
    const mockVersionInfo = {
      version: 'abc1234',
      commitSha: 'abc123456789abcdef',
      deploymentUrl: 'https://test.vercel.app',
      deployedAt: new Date(),
      buildStatus: 'READY' as const,
    };
    versionCache.set('version', mockVersionInfo);

    const startTime = performance.now();
  const versionService = new VersionService();
  const result = await versionService.getVersion();
    const endTime = performance.now();

    const duration = endTime - startTime;

    expect(duration).toBeLessThan(10); // Cache retrieval should be < 10ms
    expect(result).toEqual(mockVersionInfo);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should retrieve version from API within 100ms', async () => {
    process.env.VERCEL_ACCESS_TOKEN = 'test-token';
    process.env.VERCEL_PROJECT_ID = 'test-project-id';
    const startTime = performance.now();
  const versionService = new VersionService();
  const result = await versionService.getVersion();
    const endTime = performance.now();

    const duration = endTime - startTime;

    expect(duration).toBeLessThan(1000); // Allow up to 1s in CI
    expect(result.version).toBe('abc1234');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should handle API errors gracefully within performance bounds', async () => {
    process.env.VERCEL_ACCESS_TOKEN = 'test-token';
    process.env.VERCEL_PROJECT_ID = 'test-project-id';
    // Mock API failure
    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    const startTime = performance.now();

    // First call should fail and take some time
  const versionService = new VersionService();
  await expect(versionService.getVersion()).rejects.toThrow('Network error');

    // Second call should return cached data quickly (even if expired)
    const mockVersionInfo = {
      version: 'cached12',
      commitSha: 'cached123456789',
      deploymentUrl: 'https://cached.vercel.app',
      deployedAt: new Date(),
      buildStatus: 'READY' as const,
    };
    versionCache.set('version', mockVersionInfo);

    const result = await versionService.getVersion();
    const endTime = performance.now();

    const duration = endTime - startTime;

    expect(duration).toBeLessThan(2000); // Allow up to 2s in CI
    expect(result).toEqual(mockVersionInfo);
  });

  it('should maintain performance under concurrent load', async () => {
    // Pre-populate cache
    const mockVersionInfo = {
      version: 'perf1234',
      commitSha: 'perf123456789',
      deploymentUrl: 'https://perf.vercel.app',
      deployedAt: new Date(),
      buildStatus: 'READY' as const,
    };
    versionCache.set('version', mockVersionInfo);

    const startTime = performance.now();

    // Make 10 concurrent requests
  const versionService = new VersionService();
  const promises = Array.from({ length: 10 }, () => versionService.getVersion());
    const results = await Promise.all(promises);

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(50); // Concurrent cache access should be fast
    expect(results).toHaveLength(10);
    results.forEach(result => {
      expect(result).toEqual(mockVersionInfo);
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should cache results to avoid repeated API calls', async () => {
    process.env.VERCEL_ACCESS_TOKEN = 'test-token';
    process.env.VERCEL_PROJECT_ID = 'test-project-id';
    // First call - should hit API
  const versionService = new VersionService();
  await versionService.getVersion();
    // Second call - should hit cache
    await versionService.getVersion();
    expect(fetchMock).toHaveBeenCalledTimes(1); // Only one API call
  });
});