// lib/types/vercel.ts
// TypeScript interfaces for Vercel API integration

export interface VercelDeployment {
  id: string;
  name: string;
  url: string;
  createdAt: number;
  state: 'READY' | 'BUILDING' | 'ERROR' | 'CANCELED';
  meta?: {
    githubCommitSha?: string;
    githubCommitMessage?: string;
    githubCommitAuthorName?: string;
  };
  inspectorUrl: string;
}

export interface VercelApiResponse {
  deployments: VercelDeployment[];
  pagination?: {
    count: number;
    next?: string;
    prev?: string;
  };
}

export interface VersionInfo {
  version: string;
  commitSha: string | null;
  deploymentUrl: string;
  deployedAt: Date;
  buildStatus: 'READY' | 'BUILDING' | 'ERROR' | 'CANCELED';
}

export class VercelApiError extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'VercelApiError';
    this.code = code;
  }
}