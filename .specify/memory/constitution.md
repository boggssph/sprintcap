<!--
SYNC IMPACT REPORT
- Version change: auto -> 2.2.0
- Updated via apply-constitution.sh
-->

# sprintCap Constitution

## Agent-provided Principles (from /constitution)

Agent Iterative Assurance (NON-NEGOTIABLE): Agent must iterate until >=95% of acceptance tests are satisfied; Truthful Alignment: agent must record rationale and assumptions; Enterprise Best Practices: TDD, observability, feature flags, backward-compatible migrations; Security-First (NON-NEGOTIABLE): secrets never committed, tokens stored hashed; CI Gates: lint/tests/SAST/SCA required before merge

## Governance
**Version**: 2.2.0 | **Ratified**: 2025-09-27 | **Last Amended**: 2025-09-27

## Project-wide Tech Stack & Visual Design Principles (ENFORCED)
The following technology and design constraints are project-wide, non-negotiable rules. `/plan` MUST run a Constitution Check and flag any feature plan that deviates from these choices unless an explicit exception is recorded and approved in this Constitution with rationale.

- Language & Framework:
	- TypeScript (v5.x) as the sole language for application code.
	- Next.js (App Router) as the canonical web framework.

- UI & Styling:
	- Tailwind CSS as the styling system.
	- shadcn/ui components must be used exclusively as the project's UI primitives and design system. Any deviation requires an approved exception recorded in this Constitution with a rationale and migration plan.

- Persistence & Hosting:
	- Prisma ORM with PostgreSQL (Neon preferred) for primary persistence.
	- Application hosting on Vercel for frontend/backend deployments; Neon for Postgres.

- Auth & Email:
	- NextAuth as the authentication framework (Google provider in production). Dev-only bypass middleware allowed but must be disabled in production by runtime guard.
	- Brevo for transactional emails (invites, revocations).

- Testing & CI:
	- Vitest for unit tests and Playwright for E2E; CI must run lint/typecheck, unit tests, SAST/SCA before merges.

Enforcement: `/plan` will perform a Constitution Check. Violations must either be fixed or an exception recorded here with explicit justification; failing to do so is a hard block for merge.

## Secrets & Environment Variable Policy (ENFORCED)
- All secrets and environment variables MUST be stored and managed in Vercel Environment Variables (or another approved secrets manager) and MUST NOT be committed to the repository in any form.
- Local development should use `vercel env pull` or a local `.env.local` generated from Vercel for convenience, but `.env*` files must be included in `.gitignore` and never committed.
- If any secret (for example a DATABASE_URL) is found in the repository or its history, the secret MUST be rotated immediately and an incident note added to the Constitution sync impact report.


