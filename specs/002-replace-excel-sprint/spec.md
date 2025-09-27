# Feature Specification: Replace Excel Sprint Capacity Plan with sprintCap web app

**Feature Branch**: `002-replace-excel-sprint`  
**Created**: 2025-09-26  
**Status**: Draft  
**Input**: Replace the Excel Sprint Capacity Plan with a web app; capture implemented features and outstanding work (see requirements below).

## Overview
This feature replaces the existing Excel-based sprint capacity planning process with a web application that supports invitation-based onboarding, role-based access, audit logging, and automated capacity management. The spec captures both implemented pieces and remaining user stories, and provides measurable acceptance criteria to drive `/plan` and `/tasks` phases.

## Clarifications

### Session 2025-09-26
- Q: Which default invite token expiry should we use? → A: 72 hours
- Q: Should invite emails include a one-click accept link (auto-fill token) or only the raw token? → A: One-click accept link (auto-fill token)
 - Q: What scope should the dev auth-bypass have (per-route vs global)? → A: Global middleware (dev-only)

### Session 2025-09-26 (clarify follow-up)
- Q: What is the audit log retention period? → A: 365 days (1 year) for audit logs; older entries may be archived per Ops runbook.
- Q: What is the DB backup and retention policy for DR? → A: Daily backups with 30-day retention; weekly snapshots retained for 90 days; point-in-time recovery enabled if supported by Neon.
- Q: What is the initial scale/scope target? → A: Target initial customer base ~10k users (concurrent active users expected to be much lower); plan for horizontal scaling and ability to handle 10k seeded invite records in Admin UI.
- Q: Confirm performance & CI gates? → A: Invite API p95 < 200ms target confirmed; CI must run lint/typecheck, unit tests (Vitest), Playwright E2E, SAST and SCA checks and block merges on critical findings.
- Q: Any remaining ambiguous items or placeholders? → A: None remain in this feature spec; all REQUIRED decisions for /plan are now recorded. If further exceptions are required, record them in the Constitution before /plan.

## User Scenarios & Testing (mandatory)

### Primary User Story — Admin creates invites and team capacities
As an ADMIN, I can create invitation links for team members (SCRUM_MASTER or MEMBER roles), copy or send a one-time plaintext token link, regenerate or revoke tokens, and view audit history so that onboarding is secure, auditable, and easy to manage.

Acceptance Scenarios
1. Given an authenticated ADMIN on the Admin UI, when they create an invite for `SCRUM_MASTER`, then the system returns a one-time plaintext token and records the invite with a hashed token in DB and an AuditLog entry.
2. Given an ADMIN who regenerates an invite, when they request regeneration, then the previous invite is marked EXPIRED, a new invite (hashed in DB) is created and the new plaintext token is shown exactly once; an AuditLog entry records the action.
3. Given a user receives an invite link and submits it with their email on the Accept page, when the token matches a hashed token and is not expired, then the user account is created/linked and the invite status is marked ACCEPTED with an AuditLog entry.
4. Given an ADMIN revokes an invite, when revoke is confirmed, then the invite's status becomes EXPIRED and a revoke email is sent; Playwright E2E covers the UI flow.

Edge Cases
- Attempt to accept with an expired token: system rejects acceptance and records a failed attempt in AuditLog.
- Concurrent regenerate/revoke operations: system enforces last-write-wins semantics and records both actions in AuditLog.
- Clipboard/copy failure: Admin UI shows a fallback copy notification and the token remains valid until revoked/regenerated.
 - One-click link misuse: one-click accept links are single-use and auto-expire; acceptance requires matching invitedEmail when available or explicit confirmation flow.

## Functional Requirements (testable)

Implemented (must continue to be maintained)
- FR-IMPL-001: The system MUST provide an Admin UI at `/app/admin` to create, list, regenerate, revoke invites and view simple audit entries. (Implemented)
- FR-IMPL-002: The Invite API MUST store only `tokenHash` (SHA-256) in the database; plaintext tokens are returned exactly once on creation/regeneration. (Implemented)
- FR-IMPL-003: The system MUST send transactional emails for invite creation and revocation (Brevo configured). (Implemented)
- FR-IMPL-004: Authentication: NextAuth with Google provider configured for production and a Credentials provider for local/dev ease; the first sign-in is bootstrapped as ADMIN when DB has no users. (Implemented)
- FR-IMPL-005: Tests: Vitest unit tests and Playwright E2E tests exist; E2E uses `data-testid` selectors and route stubs to stabilize tests. (Implemented)

Pending / Improvements (user stories to plan & implement)
- FR-PEND-101 (Dev auth consistency): Provide a dev-only middleware that enables `x-test-user` or `?test_user=` bypass across all API routes for local/E2E; it MUST be disabled in production. Acceptance: middleware exists and Playwright tests use it to avoid external auth flows.
 - FR-PEND-101 (Dev auth consistency): Provide a dev-only global middleware that enables `x-test-user` or `?test_user=` bypass across all API routes and edge middleware for local/E2E; it MUST be disabled in production. Acceptance: middleware exists as a global dev-only middleware (not per-route), Playwright tests use it to avoid external auth flows, and a runtime guard prevents its activation in production environments.
- FR-PEND-102 (CI resilience): CI must run a server health-check and wait for readiness before Playwright e2e; acceptance: CI job includes readiness probe and e2e reliably runs in CI.
- FR-PEND-103 (Security hardening): Add SAST and SCA steps to CI that block merges on critical findings; acceptance: CI fails when SCA finds critical CVEs and SAST flags high-severity issues.
- FR-PEND-104 (Observability): Emit structured logs (JSON), metrics (errors, latency) and include trace IDs; acceptance: new metrics dashboard shows basic error and latency metrics for invite endpoints.
- FR-PEND-105 (Rate limiting & abuse): Add rate-limiting to invite-related endpoints (create/regenerate/accept) with measurable thresholds and tests for throttling behavior.
- FR-PEND-106 (Admin UX): Improve pagination and search in Admin UI; acceptance: Admin can search invites by email and page through results with stable performance for 10k invites.
- FR-PEND-107 (Backup & DR): Add DB backup schedule and a documented restore runbook; acceptance: runbook tested in staging restore exercise.

## Key Entities
- User: {id, email, role (ADMIN|SCRUM_MASTER|MEMBER), createdAt, lastSeen}
- Invitation: {id, invitedEmail, tokenHash, invitedRole, status (PENDING|ACCEPTED|EXPIRED), expiresAt, createdBy, createdAt}
	- Note: `expiresAt` default TTL = 72 hours (tokens expire 72 hours after creation unless explicitly revoked/regenerated).
- AuditLog: {id, actorId, action, targetId, metadata, createdAt}
- CapacityPlan / Sprint (future scope): {id, sprintName, startDate, endDate, capacityEntries[]}

## Non-functional Requirements
- Security: secrets must not be committed; tokens hashed; TLS required in prod; session management follows secure-cookie defaults; audit log retention policy defined in plan.
	- Invite token TTL: tokens expire 72 hours after creation by default; acceptance/revocation flows must enforce expiry.
	- Invite email links: invitation emails include a one-click accept link that auto-fills the token on the Accept page; these links are single-use and follow the same TTL.
- Testing: Unit tests cover new server/business logic; Playwright E2E covers the admin invite flows and accept-invite flows; coverage thresholds defined per-feature in `/plan`.
- Performance: Invite API p95 latency < 200ms under normal load; scale plan included for production sizing.

## Acceptance Criteria (measurable test cases)
1. Unit tests for token utilities and invite service pass (Vitest) — CI must run and pass locally and in CI.
2. Playwright E2E: create → copy link → accept flow completes end-to-end (uses dev bypass in CI or email interception) — tests stable and deterministic.
2b. Playwright E2E: create → click one-click accept link → accept flow completes end-to-end; tests verify single-use and expiry behavior.
3. Invite tokens are stored as SHA-256 hashes; no plaintext tokens in DB snapshots.
4. Regenerate flow: previous invite becomes EXPIRED; new invite accepted and audited.
5. Revoke flow: invite becomes EXPIRED and revoke email is sent; audit entry created.
7. Invite tokens expire 72 hours after creation; acceptance attempts after expiry are rejected and logged.
6. CI includes lint/typecheck and tests; merges to `main` require passing CI and one human reviewer for medium+ risk changes.

## Risks & Assumptions
- Assumption: Brevo email service credentials are available to send invites in staging/prod. If not, E2E must use email interception/mocks.
- Risk: Playwright E2E may be flaky if environment readiness is not awaited; mitigations include health checks and retries.

## Tech Stack & Visual Design Principles (this feature)
These choices are authoritative for `/plan` and downstream `/tasks` for the `002-replace-excel-sprint` feature.

- Tech stack (canonical for this feature):
	- Language: TypeScript (v5.x)
	- Framework: Next.js (App Router)
	- UI: Tailwind CSS + shadcn/ui (use shadcn/ui components exclusively unless a documented exception exists)
	- ORM/DB: Prisma + PostgreSQL (Neon preferred)
	- Auth: NextAuth (Google in production, Credentials/dev bypass for local/E2E)
	- Hosting: Vercel (app), Neon (Postgres)
	- Email: Brevo for transactional invites
	- Testing: Vitest (unit) and Playwright (E2E)

- Visual design principles (constraints for implementers):
	- Use shadcn/ui components as the single source of truth for UI primitives and composition.
	- Tailwind utility-first styling; prefer theme tokens and variants over ad-hoc CSS.
	- Accessibility (WCAG AA): semantic markup, focus management, and aria attributes are required for interactive components.
	- Responsive-first design: layouts must adapt from mobile → desktop; validate at common breakpoints.
	- Centralized design tokens: colors, spacing, typography controlled via Tailwind config.
	- Minimize custom CSS and avoid inline styles; prefer component variants and utility classes.
	- Include `data-testid` attributes on key UI elements to stabilize Playwright tests.

If an implementer needs to deviate from these choices, they must add a short rationale to this spec and surface the deviation during the Constitution Check in `/plan`.

## Next Steps for /plan
1. Run `/clarify` to remove any remaining ambiguities (e.g., retention windows, invite TTL).  
2. Run `/plan` to produce a technical implementation plan, CI job definitions, SAST/SCA integration steps, and observability tasks.  
3. Run `/tasks` to break the plan into small, testable tasks mapped to the Acceptance Criteria above.

## Review & Acceptance Checklist (GATE)
- [ ] Spec includes user stories and acceptance criteria (this file)  
- [ ] No high-level ambiguities remain (run `/clarify`)  
- [ ] All acceptance criteria are measurable and testable  
- [ ] Stakeholders (Product, Security, Ops) acknowledge this spec

