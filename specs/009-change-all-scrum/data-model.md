# Phase 1: Data Model (UI-only)

This feature is presentational and does not introduce new persisted entities. Documenting UI components and props for clarity.

- Component: `ScrumMasterNav` (wrapper around existing shadcn navigation menu)
  - props:
    - `items: MenuItem[]` (existing shape preserved)
    - `className?: string`
    - `collapseBreakpoint?: number` (default: 640)
    - `sticky?: boolean` (default: false)

- Component: `MenuItem`
  - fields: `id`, `label`, `href?`, `children?`

Validation rules: ensure `items` is an array and `id` is unique within the menu.
