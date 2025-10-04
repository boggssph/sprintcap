// Set up test environment variables before importing
process.env.VERCEL_ACCESS_TOKEN = '7rYzr1PZPGWWRH8CsQTPorGv';
process.env.VERCEL_PROJECT_ID = 'prj_hB0eZNpWpKUIrPCWcVrIkufmCMoT';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VersionService } from '../../../lib/services/versionService';
import { versionCache } from '../../../lib/services/versionCache';
import { VercelApiError } from '../../../lib/types/vercel';

// Mock fetch globally
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('VersionService', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    versionCache.clearAll();
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

  describe('getVersion', () => {
    it('should return cached version if available and valid', async () => {
      const mockVersionInfo = {
        version: 'abc1234',
        commitSha: 'abc123456789',
        deploymentUrl: 'https://test.vercel.app',
        deployedAt: new Date(),
        buildStatus: 'READY' as const,
      };

      // Pre-populate cache
      versionCache.set('version', mockVersionInfo);

  const versionService = new VersionService();
  const result = await versionService.getVersion();

      expect(result).toEqual(mockVersionInfo);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should fetch from API if cache is empty', async () => {
  process.env.VERCEL_ACCESS_TOKEN = 'test-token';
  process.env.VERCEL_PROJECT_ID = 'test-project-id';
      const mockApiResponse = {
        deployments: [{
          id: 'dpl_123',
          name: 'test-deployment',
          url: 'https://test.vercel.app',
          createdAt: Date.now(),
          state: 'READY',
          meta: {
            githubCommitSha: 'abc123456789',
          },
          inspectorUrl: 'https://vercel.com/inspect/test',
        }],
      };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });
  const versionService = new VersionService();
  const result = await versionService.getVersion();
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.vercel.com/v6/deployments?projectId=test-project-id&limit=1&state=READY',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      );
      expect(result.version).toBe('abc1234'); // First 7 chars of commit SHA
      expect(result.commitSha).toBe('abc123456789');
      expect(result.deploymentUrl).toBe('https://test.vercel.app');
      expect(result.buildStatus).toBe('READY');
    });

    it('should handle API authentication failure', async () => {
      process.env.VERCEL_ACCESS_TOKEN = 'test-token';
      process.env.VERCEL_PROJECT_ID = 'test-project-id';
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Invalid Vercel API token' })
      });
  const versionService = new VersionService();
  await expect(versionService.getVersion()).rejects.toThrow('Invalid Vercel API token');
    });

    it('should handle network failures', async () => {
  process.env.VERCEL_ACCESS_TOKEN = 'test-token';
  process.env.VERCEL_PROJECT_ID = 'test-project-id';
  fetchMock.mockRejectedValueOnce(new Error('Network error'));
  const versionService = new VersionService();
  await expect(versionService.getVersion()).rejects.toThrow('Network error');
    });

    it('should handle rate limiting', async () => {
    process.env.VERCEL_ACCESS_TOKEN = 'test-token';
    process.env.VERCEL_PROJECT_ID = 'test-project-id';
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ error: 'Rate limit exceeded' })
      });
  const versionService = new VersionService();
  await expect(versionService.getVersion()).rejects.toThrow('Rate limit exceeded');
    });

    it('should return cached version on API failure if cache exists', async () => {
      process.env.VERCEL_ACCESS_TOKEN = 'test-token';
      process.env.VERCEL_PROJECT_ID = 'test-project-id';
      const mockVersionInfo = {
        version: 'cached123',
        commitSha: 'cached123456789',
        deploymentUrl: 'https://cached.vercel.app',
        deployedAt: new Date(),
        buildStatus: 'READY' as const,
      };

      // Pre-populate cache
      versionCache.set('version', mockVersionInfo);

      // Make API fail
      fetchMock.mockRejectedValueOnce(new Error('API down'));

      const versionService = new VersionService();
      const result = await versionService.getVersion();

      // Should return cached version
      expect(result).toEqual(mockVersionInfo);
    });

    it('should use deployment ID as fallback when no commit SHA', async () => {
  process.env.VERCEL_ACCESS_TOKEN = 'test-token';
  process.env.VERCEL_PROJECT_ID = 'test-project-id';
  const mockApiResponse = {
        deployments: [{
          id: 'dpl_123456789',
          name: 'test-deployment',
          url: 'https://test.vercel.app',
          createdAt: Date.now(),
          state: 'READY',
          inspectorUrl: 'https://vercel.com/inspect/test',
        }],
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

  const versionService = new VersionService();
  const result = await versionService.getVersion();

      expect(result.version).toBe('dpl_123'); // First 7 chars of deployment ID
      expect(result.commitSha).toBeNull();
    });
  });

  describe('clearCache', () => {
    it('should clear the version cache', () => {
      const mockVersionInfo = {
        version: 'test123',
        commitSha: null,
        deploymentUrl: 'https://test.vercel.app',
        deployedAt: new Date(),
        buildStatus: 'READY' as const,
      };

      versionCache.set('version', mockVersionInfo);
      expect(versionCache.get('version')).toEqual(mockVersionInfo);

      const versionService = new VersionService();
      versionService.clearCache();

      expect(versionCache.get('version')).toBeNull();
    });
  });

  describe('getCacheStatus', () => {
    it('should return cache status', () => {
  const versionService = new VersionService();
  const status = versionService.getCacheStatus();
      expect(status).toHaveProperty('hasCache');
      if (status.hasCache) {
        expect(status).toHaveProperty('age');
        expect(status).toHaveProperty('isValid');
      }
    });
  });

  describe('environment validation', () => {
    it('should throw error if VERCEL_ACCESS_TOKEN is missing', () => {
      // Always set VERCEL_PROJECT_ID so only ACCESS_TOKEN is missing
      process.env.VERCEL_PROJECT_ID = 'test-project-id';
      delete process.env.VERCEL_ACCESS_TOKEN;
  const versionService = new VersionService();
  return expect(versionService.getVersion()).rejects.toThrow('VERCEL_ACCESS_TOKEN environment variable is required');
    });

    it('should throw error if VERCEL_PROJECT_ID is missing', async () => {
      // Always set VERCEL_ACCESS_TOKEN so only PROJECT_ID is missing
      process.env.VERCEL_ACCESS_TOKEN = 'test-token';
      delete process.env.VERCEL_PROJECT_ID;
  const versionService = new VersionService();
  await expect(versionService.getVersion()).rejects.toThrow('VERCEL_PROJECT_ID environment variable is required');
    });
  });
});