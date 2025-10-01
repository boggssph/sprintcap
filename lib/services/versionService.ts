import { VercelDeployment, VercelApiResponse, VersionInfo, VercelApiError } from '../types/vercel';
import { versionCache } from './versionCache';

const VERCEL_API_BASE = 'https://api.vercel.com';

export class VersionService {
  private static instance: VersionService;
  private apiToken: string;

  private constructor() {
    const token = process.env.VERCEL_ACCESS_TOKEN;
    if (!token) {
      throw new Error('VERCEL_ACCESS_TOKEN environment variable is required');
    }
    this.apiToken = token;
  }

  public static getInstance(): VersionService {
    if (!VersionService.instance) {
      VersionService.instance = new VersionService();
    }
    return VersionService.instance;
  }

  // Test-only method to create a fresh instance
  public static createTestInstance(): VersionService {
    return new VersionService();
  }

  /**
   * Get the latest deployment version information
   * @returns Promise<VersionInfo> - The version information
   * @throws VercelApiError - If the API call fails
   */
  public async getVersion(): Promise<VersionInfo> {
    // Check cache first
    const cached = versionCache.get('version');
    if (cached) {
      return cached;
    }

    try {
      const deployment = await this.fetchLatestDeployment();
      const versionInfo = this.transformDeploymentToVersion(deployment);

      // Cache the result
      versionCache.set('version', versionInfo);

      return versionInfo;
    } catch (error) {
      // If we have cached data, return it even if expired
      const expiredCached = versionCache.get('version');
      if (expiredCached) {
        return expiredCached;
      }

      // Otherwise, throw the error
      throw error;
    }
  }

  /**
   * Fetch the latest deployment from Vercel API
   */
  private async fetchLatestDeployment(): Promise<VercelDeployment> {
    const projectId = process.env.VERCEL_PROJECT_ID;
    if (!projectId) {
      throw new VercelApiError('VERCEL_PROJECT_ID environment variable is required', 'CONFIG_ERROR');
    }

    const url = `${VERCEL_API_BASE}/v6/deployments?projectId=${projectId}&limit=1&state=READY`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new VercelApiError('Invalid Vercel API token', 'AUTH_ERROR');
      } else if (response.status === 403) {
        throw new VercelApiError('Insufficient permissions to access Vercel API', 'PERMISSION_ERROR');
      } else if (response.status === 429) {
        throw new VercelApiError('Rate limit exceeded', 'RATE_LIMIT_ERROR');
      } else {
        throw new VercelApiError(`Vercel API error: ${response.status} ${response.statusText}`, 'API_ERROR');
      }
    }

    const apiResponse: VercelApiResponse = await response.json();

    if (!apiResponse.deployments || apiResponse.deployments.length === 0) {
      throw new VercelApiError('No deployments found', 'NO_DEPLOYMENTS');
    }

    return apiResponse.deployments[0];
  }

  /**
   * Transform Vercel deployment data to our VersionInfo format
   */
  private transformDeploymentToVersion(deployment: VercelDeployment): VersionInfo {
    const commitSha = deployment.meta?.githubCommitSha;
    const shortSha = commitSha ? commitSha.substring(0, 7) : null;

    return {
      version: shortSha || deployment.id.substring(0, 7),
      commitSha: commitSha || null,
      deploymentUrl: deployment.url,
      deployedAt: new Date(deployment.createdAt),
      buildStatus: deployment.state,
    };
  }

  /**
   * Clear the version cache (useful for testing or forced refresh)
   */
  public clearCache(): void {
    versionCache.clear('version');
  }

  /**
   * Get cache status for debugging
   */
  public getCacheStatus(): { hasCache: boolean; age?: number; isValid?: boolean } {
    return versionCache.getStatus('version');
  }
}

// Export singleton instance
export const versionService = VersionService.getInstance();