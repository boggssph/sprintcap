import { describe, it, expect, beforeEach, vi } from 'vitest';
import { versionCache } from '../../../lib/services/versionCache';
import { VersionInfo } from '../../../lib/types/vercel';

describe('VersionCache', () => {
  beforeEach(() => {
    versionCache.clearAll();
  });

  describe('get and set', () => {
    it('should store and retrieve version info', () => {
      const mockVersionInfo: VersionInfo = {
        version: 'abc1234',
        commitSha: 'abc123456789',
        deploymentUrl: 'https://test.vercel.app',
        deployedAt: new Date(),
        buildStatus: 'READY',
      };

      versionCache.set('version', mockVersionInfo);
      const result = versionCache.get('version');

      expect(result).toEqual(mockVersionInfo);
    });

    it('should return null for non-existent keys', () => {
      const result = versionCache.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should handle multiple keys independently', () => {
      const version1: VersionInfo = {
        version: 'v1.0.0',
        commitSha: 'sha1',
        deploymentUrl: 'https://v1.vercel.app',
        deployedAt: new Date(),
        buildStatus: 'READY',
      };

      const version2: VersionInfo = {
        version: 'v2.0.0',
        commitSha: 'sha2',
        deploymentUrl: 'https://v2.vercel.app',
        deployedAt: new Date(),
        buildStatus: 'READY',
      };

      versionCache.set('version1', version1);
      versionCache.set('version2', version2);

      expect(versionCache.get('version1')).toEqual(version1);
      expect(versionCache.get('version2')).toEqual(version2);
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should return valid cached data within TTL', () => {
      const mockVersionInfo: VersionInfo = {
        version: 'test123',
        commitSha: null,
        deploymentUrl: 'https://test.vercel.app',
        deployedAt: new Date(),
        buildStatus: 'READY',
      };

      versionCache.set('version', mockVersionInfo);

      // Should still be valid immediately
      const result = versionCache.get('version');
      expect(result).toEqual(mockVersionInfo);
    });

    it('should return null for expired cache entries', () => {
      const mockVersionInfo: VersionInfo = {
        version: 'test123',
        commitSha: null,
        deploymentUrl: 'https://test.vercel.app',
        deployedAt: new Date(),
        buildStatus: 'READY',
      };

      // Mock Date.now to simulate time passing
      const originalNow = Date.now;
      const mockNow = vi.fn();

      // Set cache
      mockNow.mockReturnValue(1000);
      Date.now = mockNow;
      versionCache.set('version', mockVersionInfo);

      // Simulate 31 seconds later (past 30s TTL)
      mockNow.mockReturnValue(1000 + 31 * 1000);
      Date.now = mockNow;

      const result = versionCache.get('version');
      expect(result).toBeNull();

      // Restore original Date.now
      Date.now = originalNow;
    });
  });

  describe('clear operations', () => {
    it('should clear specific cache entry', () => {
      const mockVersionInfo: VersionInfo = {
        version: 'test123',
        commitSha: null,
        deploymentUrl: 'https://test.vercel.app',
        deployedAt: new Date(),
        buildStatus: 'READY',
      };

      versionCache.set('version', mockVersionInfo);
      expect(versionCache.get('version')).toEqual(mockVersionInfo);

      versionCache.clear('version');
      expect(versionCache.get('version')).toBeNull();
    });

    it('should clear all cache entries', () => {
      const version1: VersionInfo = {
        version: 'v1.0.0',
        commitSha: 'sha1',
        deploymentUrl: 'https://v1.vercel.app',
        deployedAt: new Date(),
        buildStatus: 'READY',
      };

      const version2: VersionInfo = {
        version: 'v2.0.0',
        commitSha: 'sha2',
        deploymentUrl: 'https://v2.vercel.app',
        deployedAt: new Date(),
        buildStatus: 'READY',
      };

      versionCache.set('version1', version1);
      versionCache.set('version2', version2);

      versionCache.clearAll();

      expect(versionCache.get('version1')).toBeNull();
      expect(versionCache.get('version2')).toBeNull();
    });
  });

  describe('getStatus', () => {
    it('should return status for existing cache entry', () => {
      const mockVersionInfo: VersionInfo = {
        version: 'test123',
        commitSha: null,
        deploymentUrl: 'https://test.vercel.app',
        deployedAt: new Date(),
        buildStatus: 'READY',
      };

      versionCache.set('version', mockVersionInfo);
      const status = versionCache.getStatus('version');

      expect(status.hasCache).toBe(true);
      expect(typeof status.age).toBe('number');
      expect(status.isValid).toBe(true);
    });

    it('should return no cache status for non-existent entries', () => {
      const status = versionCache.getStatus('nonexistent');

      expect(status.hasCache).toBe(false);
      expect(status.age).toBeUndefined();
      expect(status.isValid).toBeUndefined();
    });
  });

  describe('getKeys', () => {
    it('should return all cache keys', () => {
      versionCache.set('version1', {} as VersionInfo);
      versionCache.set('version2', {} as VersionInfo);

      const keys = versionCache.getKeys();
      expect(keys).toContain('version1');
      expect(keys).toContain('version2');
      expect(keys.length).toBe(2);
    });

    it('should return empty array when cache is empty', () => {
      const keys = versionCache.getKeys();
      expect(keys).toEqual([]);
    });
  });
});