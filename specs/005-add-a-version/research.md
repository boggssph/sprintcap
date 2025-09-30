# Research Findings: Add Version Number Display

## Git Commit Hash Retrieval in Next.js

**Decision**: Use Next.js environment variables with build-time injection via Vercel build command
**Rationale**: Allows dynamic version injection during build without runtime git access, follows established project patterns for environment variables
**Alternatives considered**:
- Runtime git command execution (rejected: security concerns, unreliable in production)
- Static version file (rejected: requires manual updates, not automated)
- Package.json version (rejected: doesn't reflect git state, less granular)

**Implementation approach**:
```bash
# In package.json build script or Vercel build command
export NEXT_PUBLIC_VERSION=$(git describe --always --tags --dirty)
```

## Landing Page Layout Analysis

**Decision**: Modify existing app/page.tsx component with conditional rendering
**Rationale**: Leverages existing authentication state and layout, minimal changes to established structure
**Alternatives considered**:
- Create separate version component (rejected: over-engineering for simple text display)
- Global layout modification (rejected: affects all pages unnecessarily)

**Current layout structure**:
- Non-authenticated: Shows sign-in prompt + "Built with focus" text
- Authenticated: Shows dashboard link + sign out button
- Version will be positioned below respective anchor elements

## Responsive Font Sizing

**Decision**: Use Tailwind responsive text utilities with custom size for 6px
**Rationale**: Maintains design system consistency, allows precise control, responsive behavior
**Alternatives considered**:
- Fixed 6px font (rejected: not responsive, poor mobile experience)
- Relative sizing only (rejected: cannot achieve exact 6px requirement)

**Implementation approach**:
```tsx
// Desktop: 6px, Mobile: smaller but readable
className="text-[6px] sm:text-[8px] md:text-[10px]"
```

## Version Format Specification

**Decision**: Display raw git describe output (e.g., "v1.0.0-5-gabc1234")
**Rationale**: Provides full version context including tag, commits ahead, and abbreviated hash
**Alternatives considered**:
- Short hash only (rejected: loses tag information)
- Clean tags only (rejected: doesn't show development state)
- Custom formatting (rejected: adds complexity without benefit)

## Error Handling Strategy

**Decision**: Graceful fallback with "Version unavailable" message
**Rationale**: User-friendly error handling, matches specification requirements
**Alternatives considered**:
- Hide version entirely (rejected: inconsistent with "always visible" requirement)
- Show error icon (rejected: over-engineering for non-critical feature)

## Mobile Behavior

**Decision**: Smaller font size on mobile while maintaining readability
**Rationale**: Balances specification requirements with mobile usability
**Alternatives considered**:
- Same size on mobile (rejected: too small to read on mobile)
- Hide on mobile (rejected: violates "visible to all users" requirement)