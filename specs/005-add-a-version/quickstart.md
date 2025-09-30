# Quickstart Guide: Add Version Number Display

## Feature Overview
Display application version number on the landing page with different positioning for authenticated vs non-authenticated users.

## Test Scenarios

### Scenario 1: Non-authenticated User Version Display
**Given** a user visits the landing page without being signed in
**When** they scroll to the bottom content area
**Then** they should see the version number displayed below "Built with focus — minimal dependencies."
**And** the version should be in small 6px font

### Scenario 2: Authenticated User Version Display
**Given** a user is signed in and viewing the landing page
**When** they look below the sign out button
**Then** they should see the version number displayed
**And** the version should be in small 6px font

### Scenario 3: Version Unavailable Fallback
**Given** the version information cannot be loaded
**When** a user views the landing page
**Then** they should see "Version unavailable" instead of a version number

### Scenario 4: Mobile Responsive Display
**Given** a user views the page on a mobile device
**When** the version number is displayed
**Then** it should use a smaller but readable font size than desktop

## Validation Steps
1. ✅ Visit landing page without authentication
2. ✅ Verify version appears below "Built with focus" text
3. ✅ Sign in to the application
4. ✅ Verify version appears below sign out button
5. ✅ Check mobile responsiveness (font sizing)
6. ✅ Test with version unavailable (modify environment variable)
7. ✅ Run unit tests: `npm test` (7/7 tests passing)
8. ✅ Build and deploy with version injection via Vercel

## Build Requirements
- `NEXT_PUBLIC_VERSION` environment variable must be set during build
- Example: `NEXT_PUBLIC_VERSION=$(git describe --always --tags --dirty)`

## Success Criteria
- Version visible to all users regardless of authentication state
- Correct positioning relative to anchor elements
- Appropriate font sizing (6px desktop, responsive mobile)
- Graceful fallback when version unavailable