# Contract: Scrum Master Navigation Menu

Purpose: Define the presentational contract for the localized `ScrumMasterNav` wrapper.

Contract:
- Component: `ScrumMasterNav`
- Props:
  - `items: MenuItem[]` — required
  - `className?: string`
  - `collapseBreakpoint?: number` — optional, default 640
  - `sticky?: boolean` — optional, default false

Behavioral guarantees for tests:
- At viewport >= collapseBreakpoint: renders a centered horizontal list immediately below header.
- At viewport < collapseBreakpoint: renders a hamburger control which expands a vertical list.
- Submenus open inline as stacked lists; do not overlap header or page content.
