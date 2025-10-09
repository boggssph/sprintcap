'use client';

import { useEffect, useState } from 'react';
import { VersionInfo } from '../lib/types/vercel';

export default function Footer() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/version');
        if (!response.ok) {
          throw new Error('API request failed');
        }
        const version = await response.json();
        setVersionInfo(version);
        setError(null);
      } catch (err) {
        // Handle API errors gracefully
        setVersionInfo(null);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersion();
  }, []);

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 max-w-screen-2xl items-center justify-center px-4 mx-auto">
        <div className="flex flex-col items-center space-y-1">
          <p className="text-sm text-muted-foreground">
            © 2025 SprintCap. All rights reserved.
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Version:</span>
            {versionInfo ? (
              <a
                href={versionInfo.deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                title={`Deployed ${versionInfo.deployedAt.toLocaleString()}`}
              >
                {versionInfo.version}
              </a>
            ) : (
              <span className="text-xs font-mono text-muted-foreground">
                {error ? 'API Error' : isLoading ? 'Loading...' : 'Unavailable'}
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}