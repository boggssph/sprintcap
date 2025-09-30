import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getVersionInfo, getVersionDisplayText } from '../../../lib/version';

describe('Version Utility Functions', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment after each test
    process.env = originalEnv;
  });

  describe('getVersionInfo', () => {
    it('should return version info when NEXT_PUBLIC_VERSION is set', () => {
      process.env.NEXT_PUBLIC_VERSION = 'v1.0.0-5-gabc1234';

      const result = getVersionInfo();

      expect(result).toEqual({
        version: 'v1.0.0-5-gabc1234',
        isAvailable: true,
        fallbackMessage: 'Version unavailable'
      });
    });

    it('should return version info when NEXT_PUBLIC_VERSION is set with whitespace', () => {
      process.env.NEXT_PUBLIC_VERSION = '  v1.0.0-5-gabc1234  ';

      const result = getVersionInfo();

      expect(result).toEqual({
        version: 'v1.0.0-5-gabc1234',
        isAvailable: true,
        fallbackMessage: 'Version unavailable'
      });
    });

    it('should return unavailable version info when NEXT_PUBLIC_VERSION is not set', () => {
      delete process.env.NEXT_PUBLIC_VERSION;

      const result = getVersionInfo();

      expect(result).toEqual({
        version: '',
        isAvailable: false,
        fallbackMessage: 'Version unavailable'
      });
    });

    it('should return unavailable version info when NEXT_PUBLIC_VERSION is empty', () => {
      process.env.NEXT_PUBLIC_VERSION = '';

      const result = getVersionInfo();

      expect(result).toEqual({
        version: '',
        isAvailable: false,
        fallbackMessage: 'Version unavailable'
      });
    });

    it('should return unavailable version info when NEXT_PUBLIC_VERSION is only whitespace', () => {
      process.env.NEXT_PUBLIC_VERSION = '   ';

      const result = getVersionInfo();

      expect(result).toEqual({
        version: '',
        isAvailable: false,
        fallbackMessage: 'Version unavailable'
      });
    });
  });

  describe('getVersionDisplayText', () => {
    it('should return version string when available', () => {
      process.env.NEXT_PUBLIC_VERSION = 'v1.0.0-5-gabc1234';

      const result = getVersionDisplayText();

      expect(result).toBe('v1.0.0-5-gabc1234');
    });

    it('should return fallback message when version is not available', () => {
      delete process.env.NEXT_PUBLIC_VERSION;

      const result = getVersionDisplayText();

      expect(result).toBe('Version unavailable');
    });
  });
});