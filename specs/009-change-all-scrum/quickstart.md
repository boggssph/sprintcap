# Quickstart: Validate basic centered navigation on Scrum Master pages

1. Checkout branch: `009-change-all-scrum`
2. Run dev server: `npm run dev`
3. Open this route locally: `http://localhost:3000/dashboard/scrum-master`
4. Confirm the navigation menu (the scoped `ScrumMasterNav` component) is centered horizontally below the header and does not overlap content. The component exposes `items` and `sticky` props — in this branch we render a simple presentational set of items below the header.
5. Resize window to mobile (<=640px) and confirm menu collapses into a hamburger control that expands a vertical list.

Acceptance: Visual confirmation + automated snapshots at desktop/tablet/mobile (Playwright snapshot tests are included under `e2e/contract` and `e2e/`).

Snapshot baseline policy (project guidance):

- CI will run Playwright visual snapshot comparisons for this feature and upload any new or differing snapshots as artifacts. If a visual diff occurs:
	1. The developer must open the Playwright snapshot artifact and verify the change is intentional.
 2. If the change is accepted, update snapshots locally (`npx playwright test --update-snapshots`) and include updated snapshots in the branch with a clear commit message referencing the change.
 3. If the change is not accepted, iterate on styles until snapshots match the approved baseline.

Running accessibility checks (axe) locally:

- Install dev dependencies (if not already): `npm install --save-dev jest-axe axe-core`
- Run the axe-gated tests locally:

```bash
ENABLE_AXE_TESTS=true npm test --silent
```

This will run the jest-axe checks included in the integration tests. In CI, axe is enabled for the vitest job by default for this branch.
