# Data Model: Add Version Number Display

## Overview
This feature displays application version information without requiring persistent data storage. Version information is derived from build-time environment variables.

## Entities

### VersionInfo
Represents the current application version information displayed to users.

**Fields**:
- `version` (string): Git commit hash or tag (e.g., "v1.0.0-5-gabc1234")
- `isAvailable` (boolean): Whether version information was successfully loaded
- `fallbackMessage` (string): Default message when version unavailable ("Version unavailable")

**Validation Rules**:
- `version`: Must be non-empty string when available
- `isAvailable`: Must be boolean
- `fallbackMessage`: Must be non-empty string

**Relationships**:
- None (standalone display component)

**State Transitions**:
- `available` → `unavailable`: When build process fails to inject version
- `unavailable` → `available`: When version injection succeeds in future builds

## Data Flow
1. Build process injects `NEXT_PUBLIC_VERSION` environment variable
2. Component reads environment variable on render
3. If available, displays version string
4. If unavailable, displays fallback message

## No Database Requirements
This feature does not require database persistence as version information is:
- Determined at build time
- Static for each deployment
- Not user-specific or mutable