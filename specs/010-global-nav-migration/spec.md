# Spec: Global Navigation Migration (placeholder)

Feature: Plan to migrate shared shadcn navigation menu to the new minimal `ScrumMasterNav` style across the site.

Rationale:
- The current change is scoped to Scrum Master pages to reduce risk. After validating visual behavior and accessibility, migrate the shared navigation component to the same minimal API and style.

Goals:
- Replace global navigation component with `ScrumMasterNav`-compatible wrapper.
- Preserve runtime API and asChild semantics so consumers require minimal changes.
- Add feature flagging for staged rollout across routes.

Neighbors / Acceptance Criteria:
- All pages that use the shared nav retain behavior after migration.
- Integration tests added for critical routes.
- CI gated rollout via feature flag.

Tasks (placeholder):
- T1: Audit current nav consumers (list files)
- T2: Implement global wrapper and run tests
- T3: Gradual rollout and monitoring

*** End Patch