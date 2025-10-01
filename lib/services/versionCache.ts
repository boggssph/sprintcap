import { VersionInfo } from '../types/vercel';

const CACHE_TTL_MS = 30 * 1000; // 30 seconds

interface CacheEntry {
  data: VersionInfo;
  timestamp: number;
}

export class VersionCache {
  private static instance: VersionCache;
  private cache: Map<string, CacheEntry> = new Map();

  private constructor() {}

  public static getInstance(): VersionCache {
    if (!VersionCache.instance) {
      VersionCache.instance = new VersionCache();
    }
    return VersionCache.instance;
  }

  /**
   * Get cached version data if still valid
   * @param key - Cache key (typically 'version')
   * @returns VersionInfo or null if not cached or expired
   */
  public get(key: string): VersionInfo | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age >= CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set version data in cache
   * @param key - Cache key (typically 'version')
   * @param data - Version information to cache
   */
  public set(key: string, data: VersionInfo): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear specific cache entry
   * @param key - Cache key to clear
   */
  public clear(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  public clearAll(): void {
    this.cache.clear();
  }

  /**
   * Get cache status for debugging
   * @param key - Cache key to check
   */
  public getStatus(key: string): { hasCache: boolean; age?: number; isValid?: boolean } {
    const entry = this.cache.get(key);
    if (!entry) {
      return { hasCache: false };
    }

    const now = Date.now();
    const age = now - entry.timestamp;
    const isValid = age < CACHE_TTL_MS;

    return { hasCache: true, age, isValid };
  }

  /**
   * Get all cache keys (for debugging)
   */
  public getKeys(): string[] {
    return Array.from(this.cache.keys());
  }
}

// Export singleton instance
export const versionCache = VersionCache.getInstance();