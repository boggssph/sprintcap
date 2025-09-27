# Tasks: 002-replace-excel-sprint

**Input**: plan.md, data-model.md, contracts/, research.md, quickstart.md

## Phase 3.1: Setup
- T001 Configure repository dependencies and scripts [P]
  - Install: Next.js, Prisma, Tailwind, shadcn/ui, NextAuth, Vitest, Playwright, Brevo SDK
  - Files: package.json, pnpm-lock.json or package-lock.json

- T002 Configure linting/formatting and CI [P]
  - Add ESLint, Prettier, TypeScript config, and GitHub Actions workflow skeleton (lint/test)
  - Files: .eslintrc, .prettierrc, .github/workflows/ci.yml

- T003 Add pre-commit secret scanning hook and Dependabot/SCA config [P]
  - Files: .github/dependabot.yml, pre-commit config

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE CORE
**CRITICAL: Write failing tests first**

- T004 [P] Contract tests from contracts/invite-api.yaml
  - Create tests/contract/test_invites_contract.ts
  - Assert request/response shapes and status codes (201, 200, 400, 410, 429)

- T005 [P] Integration tests for invite flows (create → accept → audit)
  - Create tests/integration/test_invite_flow.spec.ts (Playwright or Vitest + API client)

- T006 [P] Integration tests for regenerate/revoke and single-use tokens
  - Create tests/integration/test_regenerate_revoke.spec.ts

- T007 [P] Rate-limit tests for create/regenerate/accept endpoints
  - Create tests/integration/test_rate_limits.spec.ts

## Phase 3.3: Core Implementation (after tests fail)

- T008 [P] Add Prisma models for User, Invitation, AuditLog
  - File: prisma/schema.prisma

- T009 [P] Migration: prisma migrate dev (create initial migrations)

- T010 [P] Implement Invite service (create/regenerate/revoke/accept)
  - File: src/services/inviteService.ts
  - Ensure SHA-256 token hashing, expiresAt logic, single-use semantics

- T011 [P] Implement API endpoints
  - File: src/app/api/invites/route.ts (Next.js App Router handlers)
  - Endpoints: POST /api/invites, POST /api/invites/{id}/regenerate, POST /api/invites/{id}/revoke, POST /api/invites/accept

- T012 [P] Implement transactional email integration (Brevo)
  - File: src/lib/email.ts
  - Send invite/revoke emails with one-click link; ensure tokens not logged

- T013 [P] Implement AuditLog writes for all invite actions
  - File: src/services/auditService.ts

- T014 [P] Implement dev-bypass global middleware with runtime guard
  - File: src/lib/devAuthMiddleware.ts
  - Guard: NODE_ENV !== 'production' && DEV_AUTH_ENABLED=true
  - Log bypass uses to AuditLog

- T015 [P] Implement rate-limiting middleware for invite endpoints
  - File: src/lib/rateLimit.ts
  - Defaults: create/regenerate/revoke: 60 req/hour per admin; accept: 600 req/hour per IP

## Phase 3.4: Integration

- T016 [P] Wire Prisma connection pooling guidance (Data Proxy or pool) and env vars
  - File: README or quickstart.md updates; example env vars for Vercel

- T017 [P] Add Playwright E2E test that uses email-interception or controlled dev-bypass in CI
  - File: tests/e2e/invite_flow.spec.ts

- T018 [P] Add health-check endpoint and CI readiness/wait logic
  - File: src/app/api/health/route.ts

## Phase 3.5: Polish

- T019 [P] Admin UI: Implement invite management pages (shadcn/ui components)
  - Files: app/(admin)/page.tsx, app/(admin)/components/InviteList.tsx
  - Include data-testid attributes for Playwright

- T020 [P] Pagination & search for Admin UI for 10k+ invites (cursor pagination)
  - Files: src/services/inviteService.ts additions, frontend components

- T021 [P] Unit tests for token utilities and invite service (Vitest)

- T022 Performance tests and monitoring instrumentation (metrics & tracing)

- T023 Documentation: update quickstart, ops runbook (backup/restore), and Constitution exception process

## Dependencies & Ordering
- Tests (T004-T007) must be in place before implementation (T008-T015)
- T008 (models) blocks migrations (T009) and service implementation (T010)
- Dev-bypass (T014) should be implemented before running certain CI E2E flows that rely on it

## Estimated Effort (rough)
- Setup & CI: 4-6h
- Tests (T004-T007): 6-10h
- Core implementation (T008-T015): 2-3 days
- UI & polishing (T019-T023): 2-4 days

## Validation Checklist
- [ ] All contract tests exist and fail initially
- [ ] All entity models created
- [ ] Rate-limiting enforced and tested
- [ ] Dev-bypass guarded and audited
- [ ] CI SAST/SCA steps configured

*** End Tasks
