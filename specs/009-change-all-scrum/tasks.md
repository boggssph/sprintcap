# Tasks: Change Scrum Master UI to Basic Centered Navigation

Feature: Change Scrum Master UI to basic centered navigation below header
Branch: 009-change-all-scrum

Guiding constraints:
- Scope: Scrum Master pages only (per clarifications).
- Tech: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui.

Task conventions:
- [P] indicates tasks that can run in parallel (independent files).
- Tasks are ordered by dependency (setup → tests → implementation → polish).

 - [X] T002 - Test (contract) [P]: Create a contract test for `ScrumMasterNav` visual contract

 - [X] T001 - Setup: Create a scoped component wrapper for ScrumMasterNav

 - [X] T003 - UI: Implement centered layout styles for ScrumMasterNav (desktop)

 - [X] T004 - UI: Implement responsive collapse behavior (<=640px)
- Notes: Add `data-testid="scrummaster-nav"` to the container for deterministic testing.
 - [X] T005 - Integration: Replace usage in Scrum Master pages
- Dependency: T003

Description: Update Scrum Master dashboard layout and page(s) to import and use the new `ScrumMasterNav` wrapper instead of the shared navigation component. Limit changes to `app/dashboard/scrum-master` and any subcomponents under that route.
Files: `app/dashboard/scrum-master/page.tsx`, `app/dashboard/scrum-master/**` (update imports)
Dependency: T003, T004

- T006 - Test (integration) [P]: Snapshot and interaction tests for pages
- Description: Add Vitest/RTL and Playwright integration tests that open the Scrum Master dashboard and assert: (a) nav is centered below header (desktop), (b) menu collapses on mobile, (c) submenus do not overlap content.
- Files: `test/ui/scrum-master-nav.integration.test.tsx` (Vitest + RTL), `test/e2e/scrum-master-nav.spec.ts` (Playwright)
- Dependency: T005

- [X] T007 - Accessibility checks [P]
- Description: Run axe-core-based accessibility check on the Scrum Master page(s) and ensure keyboard navigation and ARIA attributes are present on the nav/hamburger. Axe checks are implemented and gated by `ENABLE_AXE_TESTS`; CI now runs axe during the vitest job for this branch.
- Files: add assertions in `test/ui/scrum-master-nav.integration.test.tsx`
- Dependency: T006

T008 - Docs & Quickstart
- Description: Update `specs/009-change-all-scrum/quickstart.md` with exact dev server route(s) and note the new `ScrumMasterNav` component usage example.
- Files: `/specs/009-change-all-scrum/quickstart.md`
- Dependency: T005
 - [X] T008 - Docs & Quickstart

- T009 - Polish: Add snapshot tests to CI
- Description: Add Playwright snapshot comparisons to CI workflow for the Scrum Master dashboard at three breakpoints (desktop, tablet, mobile). Ensure snapshots saved under `test-results/snapshots/009-change-all-scrum/`. Use region-only snapshots and a small pixel tolerance to limit flakiness.
- Files: `.github/workflows/playwright.yml` (if needed), test snapshots
- Dependency: T006
 - [X] T009 - Polish: Add snapshot tests to CI (snapshots uploaded as artifacts)

T010 - Follow-up task: Global migration planning
- Description: Create a follow-up ticket and spec to migrate the shared shadcn navigation menu globally using the same styling, including feature flagging and rollout plan.
- Files: `/specs/009-change-all-scrum/tasks.md` (append note), create `/specs/010-global-nav-migration/spec.md` (placeholder)
- Dependency: none (parallel)
 - [X] T010 - Follow-up task: Global migration planning (spec created at /specs/010-global-nav-migration/spec.md)

 - [X] T011 - Test (dynamic header) [P]: Validate nav placement with dynamic header heights
 - Description: Add a Playwright integration test that simulates varying header heights (e.g., banner visible/hidden, condensed header) and asserts the navigation does not overlap content at desktop (sticky) and mobile (flow). Use bounding-rect intersection checks and record failures as blocking.
 - Files: `test/e2e/scrum-master-nav-dynamic-header.spec.ts`
 - Dependency: T005, T006

T012 - CI: Add lint/typecheck CI gate
- Description: Ensure CI runs `npm run lint` and `npx tsc --noEmit` on PRs for this branch before merge. Add/update workflow if necessary.
- Files: `.github/workflows/ci.yml` (update) or add a small step in existing workflows
- Dependency: none

Parallel groups (examples):
- Group P1 (can run together): T002, T006, T007, T010, T011

How to run an individual task locally
- Example: implement T003
  1. Create `/components/ScrumMasterNav.tsx` with the wrapper and Tailwind classes.
  2. Replace imports in `app/dashboard/scrum-master/page.tsx` to use the new wrapper.
  3. Run `npm run dev` and visually confirm placement.
