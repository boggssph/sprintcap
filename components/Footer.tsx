'use client';

import { useEffect, useState } from 'react';
import { versionService } from '../lib/services/versionService';
import { VersionInfo } from '../lib/types/vercel';

export default function Footer() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip version fetching during build time
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const fetchVersion = async () => {
      try {
        setIsLoading(true);
        const version = await versionService.getVersion();
        setVersionInfo(version);
        setError(null);
      } catch (err) {
        // During build time or when API is unavailable, hide version gracefully
        setVersionInfo(null);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersion();
  }, []);

  // Don't render version during build time or on error
  if (typeof window === 'undefined' || error || (isLoading && !versionInfo)) {
    return (
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <p className="text-sm text-muted-foreground">
              © 2025 SprintCap. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-muted-foreground">
            © 2025 SprintCap. All rights reserved.
          </p>
        </div>

        {versionInfo && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Version:</span>
            <a
              href={versionInfo.deploymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
              title={`Deployed ${versionInfo.deployedAt.toLocaleString()}`}
            >
              {versionInfo.version}
            </a>
          </div>
        )}
      </div>
    </footer>
  );
}