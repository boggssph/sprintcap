# Phase 0 Research: Change Scrum Master UI to Basic Centered Navigation

Decision: Scope changes to Scrum Master dashboard pages only; defer global change. (Recorded in spec clarifications.)

Rationale:
- The user's primary concern is layout overlap in Scrum Master pages; applying scoped changes reduces risk and allows quick validation.
- A follow-up, global migration can reuse the same CSS pattern after validation.

Alternatives considered:
- Global component change: higher risk, may affect many pages; deferred.
- Introduce feature flag for visual change: useful for rollout, but adds complexity; consider in follow-up.

Research findings / tasks:
- Tailwind centering patterns (flex, justify-center, items-start) are sufficient.
- Avoid absolute positioning in menu container; use flow layout and spacing utilities.
- For small viewports, use a hamburger collapse at 640px (Tailwind `sm` breakpoint) as a default.

Open items resolved:
- Breakpoint decision: default to 640px collapse; can be adjusted later. (Spec updated.)
- Sticky vs flow decision: default to flow (not sticky) to avoid overlay complexity.
