# Research Findings: Scrum Master Member Hours Input Table

**Date**: October 14, 2025
**Feature**: 024-as-scrum-master

## Overview
All technical unknowns have been resolved through existing project constitution and feature clarifications. No additional research required.

## Key Findings

### Decision: Use shadcn/ui Table Component
**Rationale**: Constitution mandates exclusive use of shadcn/ui for UI primitives. The table component provides editable cells with proper accessibility and responsive design.
**Alternatives Considered**: Custom table implementation (rejected due to maintenance overhead), third-party table libraries (rejected due to constitution constraint).

### Decision: Prisma Model for Member Hours
**Rationale**: Constitution specifies Prisma ORM for data persistence. Hours data needs to be stored with sprint isolation and member relationships.
**Alternatives Considered**: Direct SQL queries (rejected for ORM consistency), in-memory storage (rejected for persistence requirements).

### Decision: Auto-save on Blur with Validation
**Rationale**: Feature requirements specify auto-save on focus loss with input validation. This provides immediate feedback while preventing invalid data.
**Alternatives Considered**: Save button (rejected for UX friction), real-time saving on every keystroke (rejected for performance concerns).

### Decision: Decimal Precision Handling
**Rationale**: Accept any decimal precision as clarified, allowing flexible hour entry (e.g., 2.5, 2.55).
**Alternatives Considered**: Fixed decimal places (rejected for limiting user input), integer-only (rejected for half-hour accuracy).

### Decision: Sprint Isolation
**Rationale**: Hours are tied to specific sprints with no cross-sprint interference, as clarified.
**Alternatives Considered**: Global hours per member (rejected for sprint-specific capacity planning).

## Constitution Compliance
All decisions align with constitution v2.2.0 requirements:
- TypeScript 5.x ✓
- Next.js App Router ✓
- shadcn/ui components ✓
- Prisma + PostgreSQL ✓
- NextAuth (existing) ✓
- Vitest + Playwright ✓

## Next Steps
Proceed to Phase 1 design with these confirmed technical choices.