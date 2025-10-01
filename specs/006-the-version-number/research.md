# Research: Show Vercel Deployment Version

## Research Tasks Completed

### 1. Vercel API Integration Patterns
**Decision**: Use Vercel REST API with authentication via environment variables
**Rationale**: Official Vercel API provides reliable access to deployment information. Environment variables ensure security and follow constitution requirements.
**Alternatives considered**: 
- Webhooks (too complex for read-only needs)
- Build-time injection (doesn't meet real-time requirement)
- Static deployment files (violates "no static files" requirement)

### 2. Version Information Retrieval
**Decision**: Use Vercel Deployments API endpoint to get latest production deployment
**Rationale**: Provides real-time access to current deployment metadata including build information
**Alternatives considered**:
- Git describe command (doesn't work in Vercel build environment)
- Package.json version (static, not deployment-specific)
- Environment variables (build-time only, not real-time)

### 3. Performance Optimization for < 100ms Requirement
**Decision**: Implement client-side caching with short TTL and error boundaries
**Rationale**: Balances real-time accuracy with performance. Error boundaries prevent API failures from breaking the UI.
**Alternatives considered**:
- No caching (would exceed latency requirements)
- Server-side rendering (adds complexity, potential latency)
- Static generation (violates real-time requirement)

### 4. Authentication for Vercel API
**Decision**: Use Vercel Access Token stored in environment variables
**Rationale**: Secure, follows constitution security policy, and provides necessary API access
**Alternatives considered**:
- API key in code (security violation)
- No authentication (would fail for private deployments)
- OAuth flow (overkill for server-side API calls)

### 5. Error Handling Strategy
**Decision**: Graceful degradation - hide version when API unavailable
**Rationale**: Meets "no fallback" requirement while maintaining application stability
**Alternatives considered**:
- Error messages (violates spec requirements)
- Default static version (violates "no static files" requirement)
- Application failure (unacceptable UX impact)

### 6. UI Integration Pattern
**Decision**: Footer component with conditional rendering
**Rationale**: Consistent placement across all pages, non-intrusive, follows existing UI patterns
**Alternatives considered**:
- Header display (more prominent but potentially intrusive)
- Modal/popover (adds interaction complexity)
- Inline in content (inconsistent placement)

## Technical Approach Summary

**Architecture**: Client-side API integration with error boundaries and caching
**API Endpoint**: `GET /v13/deployments` with production filter
**Authentication**: Bearer token via `VERCEL_ACCESS_TOKEN` environment variable
**Caching**: 30-second client-side cache with error fallback
**UI Pattern**: Conditional footer display with loading states
**Error Handling**: Silent failure with no version display
**Performance**: < 100ms target through caching and efficient API calls

## Dependencies Identified

- `@vercel/sdk` or direct fetch to Vercel API
- Environment variable: `VERCEL_ACCESS_TOKEN`
- Existing footer component modification
- Error boundary implementation (if not already present)

## Security Considerations

- API token stored securely in Vercel environment variables
- No token exposure in client-side code
- HTTPS-only API communication
- Rate limiting awareness (Vercel API has limits)

## Testing Strategy Outline

- Unit tests for version retrieval logic
- Integration tests for API error scenarios
- E2E tests for footer display across pages
- Performance tests for < 100ms requirement
- Security tests for token handling