# Research: 002-replace-excel-sprint

## Purpose
Capture research findings and decisions for the invite lifecycle feature, focusing on dev-bypass safety, Prisma pooling with Vercel/Neon, rate-limiting strategy, and Playwright CI resilience.

## Decisions & Rationale

1. Dev-bypass runtime guard
- Decision: Implement global dev-only middleware enabled only when NODE_ENV !== 'production' AND DEV_AUTH_ENABLED=true.
- Rationale: Provides deterministic local/E2E testing while minimizing risk of production bypass.
- Alternatives considered: per-route bypass (more fine-grained but more work), feature-flagged bypass (requires FF infra).

2. Prisma pooling recommendations
- Decision: Use Prisma Data Proxy or configure a connection pool following Neon guidance.
- Rationale: Vercel serverless deployments can exhaust Postgres connections; Data Proxy or pooling prevents connection spikes.
- Implementation note: Add example env vars and a short section in quickstart.md.

3. Rate-limiting strategy
- Decision: Apply stricter limits for admin actions (create/regenerate/revoke) and looser limits for accept endpoint; per-IP and per-account throttles. Implement Retry-After headers.
- Proposed defaults: Create/regenerate/revoke: 60 req/hour per admin account; Accept: 600 req/hour per IP plus single-use enforcement per invite.
- Rationale: Protect from abuse while allowing legitimate flows.

Redis & production rate-limiting
- Decision: Use a Redis-backed sliding-window counter for production rate-limiting. The code will fall back to an in-memory limiter if `REDIS_URL` is not configured (dev/CI). In production, provide `REDIS_URL` as an environment secret.

Prisma Data Proxy & pooling
- Guidance: Configure Prisma Data Proxy for Vercel or follow Neon pooling recommendations. Add `DATABASE_URL` and `PRISMA_DATA_PROXY_URL` (if using Data Proxy) as environment variables in Vercel/CI.

4. Playwright CI resilience
- Decision: CI must include readiness probes and retry logic before Playwright runs. Use email interception (test inbox or MailHog) in CI instead of always enabling dev bypass.
- Rationale: Reduces flakiness and avoids production bypass accidentally being enabled.

## Alternatives considered
- Use Supabase instead of Neon for integrated auth and DB functions — rejected to keep Prisma + Neon architecture and reduce migration scope.

## Actionable items for Phase 1
- Add dev-bypass middleware with runtime guards and AuditLog entries.
- Add Prisma pooling guidance to quickstart.md and environment examples.
- Implement rate-limiting middleware patterns and tests.
- Add CI health-check and email-interception configuration to quickstart.md.
