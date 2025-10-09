# Research Findings: Avatar Display Fix

**Feature**: `016-the-avatar-seem` | **Date**: October 9, 2025
**Research Focus**: Browser-specific avatar display issues, shadcn/ui Avatar component behavior, fallback mechanisms

## Research Questions & Findings

### Q1: Why do both Google avatar and initials show in Firefox?
**Finding**: Firefox has different CSS rendering behavior for the shadcn/ui Avatar component's fallback mechanism. The AvatarImage and AvatarFallback components may both be visible due to Firefox's handling of CSS `display` properties and image loading states.

**Decision**: Implement explicit conditional rendering to ensure only one avatar element displays at a time.

**Rationale**: Browser-specific CSS differences require JavaScript-level control rather than relying solely on CSS.

**Alternatives Considered**:
- CSS-only solution: Rejected due to inconsistent browser behavior
- Avatar component modification: Rejected due to maintaining shadcn/ui compatibility

### Q2: How should avatar fallback work when Google image fails to load?
**Finding**: The Avatar component should gracefully fall back to initials when the Google profile image fails to load or is unavailable.

**Decision**: Use onError handler on AvatarImage to trigger fallback to initials.

**Rationale**: Provides better user experience by showing initials instead of broken image icon.

**Alternatives Considered**:
- Always show initials: Rejected as it defeats the purpose of profile pictures
- Show generic avatar icon: Rejected as initials are more personal

### Q3: How to derive user initials from profile data?
**Finding**: User initials should be extracted from the user's display name or email address, taking the first letter of the first and last name, or first two letters of a single name.

**Decision**: Create utility function to extract initials from display name, with fallback to email if display name unavailable.

**Rationale**: Ensures consistent initial generation across the application.

**Alternatives Considered**:
- Use only first name initial: Rejected as it may not be unique enough
- Use full name: Rejected as it would be too long for avatar display

### Q4: What are the cross-browser testing requirements?
**Finding**: Avatar display must work consistently across Chrome, Firefox, Safari, and Edge. Focus testing on Firefox since that's where the issue was reported.

**Decision**: Add specific E2E tests for avatar display in Firefox using Playwright.

**Rationale**: Ensures the fix works in the problematic browser and prevents regression.

**Alternatives Considered**:
- Manual testing only: Rejected due to need for automated regression prevention
- Visual regression testing: Considered but not necessary for this text-based fix

## Technical Implementation Approach

### Component Structure
- Use existing ProfileDisplay component
- Modify avatar rendering logic to be more explicit
- Add error handling for image loading failures

### Data Flow
1. Check if user has Google profile image URL
2. If yes: Display AvatarImage with onError fallback
3. If no: Display AvatarFallback with initials
4. Ensure only one element is rendered at a time

### Testing Strategy
- Unit tests for initial generation logic
- E2E tests for avatar display in different browsers
- Visual verification that only one avatar element shows

## Open Questions Resolved
- [x] Browser-specific rendering differences: Addressed with conditional rendering
- [x] Image loading failure handling: Addressed with onError callback
- [x] Initial generation logic: Addressed with utility function
- [x] Cross-browser consistency: Addressed with targeted testing

## Dependencies & Prerequisites
- Existing shadcn/ui Avatar components
- NextAuth session data with user profile information
- Playwright testing framework for cross-browser testing

## Risk Assessment
**Low Risk**: This is a UI-only change that doesn't affect data models, APIs, or business logic. The change is isolated to avatar display components.