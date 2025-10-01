// Set up test environment variables before importing
process.env.VERCEL_ACCESS_TOKEN = 'test-token';
process.env.VERCEL_PROJECT_ID = 'test-project-id';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { versionService } from '../../../lib/services/versionService';
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

      const result = await versionService.getVersion();

      expect(result).toEqual(mockVersionInfo);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should fetch from API if cache is empty', async () => {
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
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(versionService.getVersion()).rejects.toThrow(VercelApiError);
      await expect(versionService.getVersion()).rejects.toThrow('Invalid Vercel API token');
    });

    it('should handle network failures', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      await expect(versionService.getVersion()).rejects.toThrow('Network error');
    });

    it('should handle rate limiting', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 429,
      });

      await expect(versionService.getVersion()).rejects.toThrow(VercelApiError);
      await expect(versionService.getVersion()).rejects.toThrow('Rate limit exceeded');
    });

    it('should return cached version on API failure if cache exists', async () => {
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

      const result = await versionService.getVersion();

      // Should return cached version
      expect(result).toEqual(mockVersionInfo);
    });

    it('should use deployment ID as fallback when no commit SHA', async () => {
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

      versionService.clearCache();

      expect(versionCache.get('version')).toBeNull();
    });
  });

  describe('getCacheStatus', () => {
    it('should return cache status', () => {
      const status = versionService.getCacheStatus();
      expect(status).toHaveProperty('hasCache');
      expect(status).toHaveProperty('age');
      expect(status).toHaveProperty('isValid');
    });
  });

  describe('environment validation', () => {
    it('should throw error if VERCEL_ACCESS_TOKEN is missing', () => {
      delete process.env.VERCEL_ACCESS_TOKEN;

      expect(() => versionService.getVersion()).toThrow('VERCEL_ACCESS_TOKEN environment variable is required');
    });

    it('should throw error if VERCEL_PROJECT_ID is missing', async () => {
      delete process.env.VERCEL_PROJECT_ID;

      await expect(versionService.getVersion()).rejects.toThrow('VERCEL_PROJECT_ID environment variable is required');
    });
  });
});