# Analysis: 002-replace-excel-sprint

This document is the repository-level `/analyze` output for feature `002-replace-excel-sprint`. It reviews the plan and tasks, inspects current implementation progress, lists risks and blockers, and provides a recommended, safe implementation sequence that adheres to the Constitution and the plan.

## Artifacts produced so far
- `specs/002-replace-excel-sprint/spec.md` (feature spec; clarifications resolved)
- `specs/002-replace-excel-sprint/plan.md` (implementation plan; Constitution Check: PASS)
- `specs/002-replace-excel-sprint/research.md` (phase 0 research)
- `specs/002-replace-excel-sprint/data-model.md` (entities & indexes)
- `specs/002-replace-excel-sprint/quickstart.md` (dev/CI notes)
- `specs/002-replace-excel-sprint/contracts/invite-api.yaml` (OpenAPI contract)
- `specs/002-replace-excel-sprint/tasks.md` (task list; T001-T023)

## Code changes already made (work-in-progress)
- `lib/inviteService.ts`: TTL set to 72h; regenerate creates new invite & expires prior; added `acceptInvite` function.
- `lib/tokenUtils.ts`: token generation & hashing utilities (existing, tested).
- `lib/prisma.ts`: Prisma client singleton (existing).
- `lib/devAuthMiddleware.ts`: dev-only global auth guard (creates dev user when enabled).
- `lib/rateLimit.ts`: in-memory rate limiter for local/CI testing.
- `app/api/invites/route.ts`: basic App Router handlers for create/regenerate/revoke delegating to service and applying in-process rate limits.
- Unit tests: `test/unit/*` added and passing (token utils, inviteService basic path).

## Verification status
- Unit tests: passed for added tests. (`npx vitest run` returned green for unit tests)
- E2E: Playwright suites failed when run via Vitest — they should be run with `npx playwright test` and require the app server ready and Playwright runner environment. E2E will be validated in CI with readiness probes and email interception.
- Lint/typecheck: Not run in this analysis step; recommend running `npm run build` (which runs `prisma generate && next build`) and `npm run lint` if configured.

## Risks & Open Blockers (must resolve before large-scale implement)
1. Rate-limiter is in-memory (not suitable for production). Need Redis/clustered limiter for production. (Task: add Redis-backed limiter & configuration)
2. Dev-bypass global middleware must have strict runtime guards and audit logging; ensure `DEV_AUTH_ENABLED` is only set in non-production CI with secrets. (Task: enforce runtime guard and CI secret management)
3. Prisma connection pooling must be configured for Vercel + Neon (Prisma Data Proxy or proper pooling). (Task: add Data Proxy or pooler config)
4. Playwright E2E environment setup: tests require running via Playwright runner with server readiness and email interception configured. (Task: CI job changes; Quickstart updated)
5. TypeScript typing: temporary `as any` casts used for invite role — replace with proper enum typing. (Task: refine types)

## Constitution checks
- Project-wide Constitution enforcements (TypeScript, Next.js, Tailwind + shadcn/ui exclusive, Prisma/Postgres/Neon, Vercel hosting, NextAuth, Brevo, Vitest+Playwright, CI gates) are satisfied by the current plan and early implementation. Any deviation must be recorded as an exception in the Constitution.

## Recommended implementation order (small, verifiable PRs)
1. T008/T009: Ensure Prisma models and migrations are correct (models already exist). Run `npx prisma migrate dev --name init-invites` in local branch. Commit migrations. (Small PR)
2. T010/T011/T012/T013: Implement invite service, API endpoints, email integration, and audit log writes. Keep PRs small and TDD-focused (tests should fail first). (Small PR)
3. T014: Dev-bypass middleware (already implemented) — add strong runtime guards, unit tests, and audit logging for bypass uses. (Small PR)
4. T015: Replace in-memory rate limiter with Redis-backed limiter and add configuration examples; add tests for throttling. (Small PR)
5. T016/T017/T018: Configure Prisma pooling settings, Playwright CI job with readiness probe, and email-interception for e2e. (Medium PR)
6. T019/T020: Implement Admin UI pages using shadcn/ui components and cursor pagination; include `data-testid` attributes. (Medium PR)
7. T021-T023: Unit tests, performance instrumentation, and docs/runbooks. (Polish PR)

Each PR should be gated by CI that runs lint/typecheck, unit tests (Vitest), SAST/SCA checks, and Playwright smoke e2e tests when applicable.

## Minimal `/analyze` checklist (pass criteria)
- [x] Plan exists and Constitution Check passed
- [x] Tasks generated and reviewed
- [x] Key risks identified and documented
- [x] Unit tests for new code present and passing
- [ ] E2E environment configured and smoke tests passing (CI)
- [ ] Production-ready rate-limiter and pooling configured

## Ready for `/implement`?
Yes — with caveats. The repo has a runnable core implementation and unit tests are passing. Before broad `/implement` (execute all tasks), address the two immediate hardening items first in small PRs:

- Implement Redis-backed rate limiter (T015)
- Add Prisma pooling guidance / Data Proxy configuration and run a migration (T008/T009)

## Security incident note
- During the `/analyze` step we found a committed `.env` file containing a `DATABASE_URL` connection string. That file has been removed from the repository and `.gitignore` updated. However, any exposed credentials must be rotated immediately. Please rotate the exposed database credentials and any other keys that might have been included in the removed `.env` file and document the rotations in the Constitution sync impact report.

If you approve, I will begin implementing the next PRs in this order (I can start with Redis-backed rate limiter or with the migration/more robust Prisma config). Which do you prefer me to implement first? 
