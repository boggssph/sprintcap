# tasks.md — Feature: Simple Google Sign-in and Role-directed Flow

Feature branch: 003-i-want-this
Spec: /Users/fseguerra/Projects/sprintCap/specs/003-i-want-this/spec.md

Priority rules used:
- Tests before implementation (TDD)
- Models before services before endpoints before UI
- Parallelizable tasks marked with [P]

T001 — Setup: ensure dev environment & dependencies
- Goal: Ensure the repo has required dev deps and scripts locally for running tests and migrations.
- Actions:
  - Verify Node (>=18) and npm installed.
  - Ensure `prisma`, `next`, `next-auth`, `@prisma/client`, `vitest`, `playwright`, `tailwindcss`, `shadcn/ui` exist in package.json devDependencies/dependencies.
  - Add (if missing) helpful scripts to package.json: `migrate`, `dev`, `test:unit`, `test:e2e`.
- Files/commands:
  - package.json
  - Run: `npm ci` and `npx prisma generate`

T002 [P] — Contract test: auth providers endpoint
- Goal: Create a failing contract test that asserts `/api/auth/providers` returns Google provider metadata.
- Actions:
  - Add a Vitest test file at `tests/contract/auth.providers.test.ts` that performs an HTTP GET to `/api/auth/providers` (use built-in test server or start dev server) and asserts response JSON contains `google` with `signinUrl` and `callbackUrl`.
  - Mark as [P] — can run parallel with other contract tests.
- Files:
  - tests/contract/auth.providers.test.ts

T003 [P] — Contract test: invites API
- Goal: Add contract tests for invite creation/revocation endpoints (admin-only flows will assert 401 when unauthenticated).
- Actions:
  - Add `tests/contract/invites.contract.test.ts` asserting POST /api/invites requires admin auth (401) and that POST with admin credentials returns 201 (this test will be configured to expect failure until implementation).
  - Add test for revoke endpoint expecting 200 when authorized.
- Files:
  - tests/contract/invites.contract.test.ts

T004 [P] — Model task: Prisma schema for User & Invite
- Goal: Add Prisma models for User and Invite matching data-model.md.
- Actions:
  - Edit `prisma/schema.prisma` to include `User` and `Invite` models with fields: id, email, name, role, providerId, createdAt, updatedAt; Invite fields as specified.
  - Run `npx prisma migrate dev --name add_user_invite` to generate migration files.
- Files/commands:
  - prisma/schema.prisma
  - npx prisma migrate dev --name add_user_invite

T005 — Unit test: User model CRUD (fail-first)
- Goal: Add unit tests for basic User creation & lookup by providerId/email.
- Actions:
  - Add `tests/unit/user.model.test.ts` that attempts to create a user and query by email and providerId; expect failures until model/migration applied.
- Files:
  - tests/unit/user.model.test.ts

T006 — Service: Auth callback logic (server-side) — test-first
- Goal: Implement server-side logic that, given a provider profile after NextAuth exchange, performs user lookup and enforces invite rules.
- Actions (TDD):
  1. Create `tests/integration/auth.callback.test.ts` that simulates the callback exchange and expects:
     - If providerId/email exists -> session created and redirect to appropriate role URL.
     - If providerId/email NOT exists -> redirect to `/auth/not-invited` with explanatory UI.
  2. Implement `lib/auth.ts` or update existing NextAuth adapter/callback to perform lookup:
     - Look for User by providerId; if not found, fallback to email match.
     - If found: ensure user.role is used to determine redirect.
     - If not found: deny sign-in (return false or redirect) per NextAuth flow.
  3. Ensure first-user bootstrap: when user table empty, create user with role = ADMIN.
- Files:
  - tests/integration/auth.callback.test.ts
  - lib/auth.ts (or pages/api/auth/[...nextauth].ts adapter)

T007 — NextAuth configuration & adapter
- Goal: Wire NextAuth providers and callbacks to use the service logic and secure session settings.
- Actions:
  - Ensure `pages/api/auth/[...nextauth].ts` or equivalent App Router handler exists and uses NextAuth configuration with Google provider.
  - Configure callbacks.signIn or events to call the service logic to check invites and perform first-user creation.
  - Ensure `NEXTAUTH_SECRET` handling and secure cookies are used in prod config.
- Files:
  - pages/api/auth/[...nextauth].ts or app/api/auth/[...nextauth]/route.ts

T008 — UI: Sign-in card component and route
- Goal: Implement the simple centered sign-in card and wire the CTA to lazily call `signIn('google')`.
- Actions:
  - Add `app/(public)/signin/page.tsx` or update `app/setup/scrum-master/page.tsx` (per spec) using shadcn/ui primitives and Tailwind.
  - Ensure the button lazy-imports `signIn` from `next-auth/react` and calls it on click.
  - Ensure client session provider is present so UI updates after redirect.
- Files:
  - app/setup/scrum-master/page.tsx (already updated in branch)

T009 — Integration test: End-to-end sign-in happy path (Playwright)
- Goal: E2E test where a test account (seeded) signs in and reaches appropriate role route.
- Actions:
  - Add Playwright test `tests/e2e/signin.spec.ts` that starts app, initiates sign-in (mock Google or use test provider), and asserts redirect to role-specific page.
  - Mark as high-priority but may need mocking of OAuth provider.
- Files:
  - tests/e2e/signin.spec.ts

T010 — UI: Not-invited page/UX
- Goal: Add a clear UI page shown when unknown accounts are blocked.
- Actions:
  - Create `app/auth/not-invited/page.tsx` with a clear message and an action to request access (email trigger) or contact support.
  - Wire NextAuth callback logic to redirect unknown accounts here.
- Files:
  - app/auth/not-invited/page.tsx

T011 [P] — Observability & logging
- Goal: Add structured logs for auth events (success/failure) and metrics hooks.
- Actions:
  - Add logging inside auth handlers: `lib/logger.ts` or use existing logger; log provider, providerId, email (hashed for PII), and event outcome.
  - Add metrics increment (optional) using any existing monitoring integrations.
- Files:
  - lib/logger.ts (or existing utility file)

T012 — Polish: Tests, docs, CI updates
- Goal: Add/enable unit and e2e test commands in CI, update README quickstart, and ensure migration scripts run in CI.
- Actions:
  - Add GitHub Actions step to run `npm run test:unit` and `npx prisma migrate deploy` in a preview job.
  - Update README with quickstart steps from quickstart.md.
- Files:
  - .github/workflows/ci.yml (update)
  - README.md

Parallel execution groups (examples):
- Group A [P]: T002, T003, T004, T005 (contract tests and model creation tests) — these can be prepared and started in parallel.
- Group B [P]: T009, T011 (E2E and observability) — once models and auth callbacks are mostly ready.

Task ordering summary (topological):
1. T001
2. T004 (models) -> T005 (model unit tests)
3. T002, T003 (contract tests)
4. T006 (auth callback logic tests) -> T007 (NextAuth wiring)
5. T008 (UI sign-in) -> T010 (not-invited page)
6. T009 (E2E)
7. T011 (logging/metrics)
8. T012 (CI/docs/polish)
