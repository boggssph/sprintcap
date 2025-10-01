# Data Model: Show Vercel Deployment Version

## Overview
This feature integrates with external Vercel API and does not require local data persistence. The data model focuses on API response structures and client-side state management.

## External API Data Structures

### Vercel Deployment Response
```typescript
interface VercelDeployment {
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
```

### API Response Structure
```typescript
interface VercelApiResponse {
  deployments: VercelDeployment[];
  pagination?: {
    count: number;
    next?: string;
    prev?: string;
  };
}
```

## Client-Side State Management

### Version Information State
```typescript
interface VersionInfo {
  version: string;
  deploymentId: string;
  deploymentUrl: string;
  isAvailable: boolean;
  lastFetched: number;
  error?: string;
}
```

### Cache Management
- **TTL**: 30 seconds (balances real-time accuracy with performance)
- **Storage**: Client-side memory (no localStorage to avoid stale data)
- **Invalidation**: Automatic on TTL expiry or page refresh

## Validation Rules

### API Response Validation
- Deployment state must be 'READY'
- Must have valid deployment URL
- Created timestamp must be reasonable (not in future)
- Meta information should contain commit data when available

### Client State Validation
- Version string must be non-empty when available
- Last fetched timestamp must be within cache TTL
- Error states should not persist beyond single request

## Error States

### API Error Conditions
- Network failure → Hide version display
- Authentication failure → Hide version display
- Rate limiting → Hide version display with exponential backoff
- Invalid response → Hide version display

### Recovery Strategy
- Automatic retry on next page load
- No manual refresh mechanism required
- Silent failure to maintain UX

## Performance Constraints

### Latency Requirements
- Initial load: < 100ms (cached or fast API response)
- Cache hit: < 10ms
- API call timeout: 5 seconds (with early failure)

### Resource Usage
- Memory: Minimal (single cached object)
- Network: 1 API call per 30 seconds per user session
- CPU: Negligible string processing

## Security Considerations

### API Authentication
- Token stored in server environment only
- No client-side token exposure
- HTTPS-only communication

### Data Sanitization
- API responses validated before use
- No execution of external content
- Safe string handling for display