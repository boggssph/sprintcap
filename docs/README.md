# SprintCap Documentation

This folder contains developer and testing documentation for the SprintCap project. It includes: 

- `DEVELOPMENT.md` — setup and local development instructions
- `TESTING.md` — unit and e2e testing guide
- `API.md` — API endpoints and behaviors
- `INVITE_FLOW.md` — description of invite lifecycle and internals
- `PLAYWRIGHT.md` — Playwright E2E details and how to run/debug
- `DEVELOPMENT.md` — setup and local development instructions
- `TESTING.md` — unit and e2e testing guide
- `API.md` — API endpoints and behaviors
- `INVITE_FLOW.md` — description of invite lifecycle and internals
- `PLAYWRIGHT.md` — Playwright E2E details and how to run/debug
- `CI.md` — CI configuration and Playwright integration notes

## Version Display

The application displays version information on the landing page for both authenticated and non-authenticated users:

- **Non-authenticated users**: Version appears below "Built with focus — minimal dependencies."
- **Authenticated users**: Version appears below the sign out button
- **Version source**: Git commit hash/tag injected at build time via `NEXT_PUBLIC_VERSION` environment variable
- **Fallback**: Shows "Version unavailable" if version cannot be loaded
- **Styling**: 6px font size on desktop, responsive sizing on mobile devices

Use these docs as the primary reference when onboarding new developers or running tests in CI.
