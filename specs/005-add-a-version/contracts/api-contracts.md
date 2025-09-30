# API Contracts: Add Version Number Display

## Overview
This feature is UI-only and does not introduce new API endpoints. Version information is handled client-side using build-time environment variables.

## No New Endpoints Required

**Rationale**: Version display uses `NEXT_PUBLIC_VERSION` environment variable injected during build process, requiring no server-side API calls.

## Existing Endpoints Used
- None - This feature modifies existing landing page UI only

## Contract Tests
No new contract tests required as no new API endpoints are added.

## Integration Points
- Build process must inject `NEXT_PUBLIC_VERSION` environment variable
- Vercel deployment configuration must include version injection command