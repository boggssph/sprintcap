# SprintCap Docs Site

Welcome to the SprintCap single-page docs. This site mirrors the repository documentation and provides quick links and examples for developers.

Contents

- Development: `DEVELOPMENT.md`
- Testing: `TESTING.md`
- API: `API.md` (includes curl examples and OpenAPI spec)
- Invite Flow: `INVITE_FLOW.md`
- Playwright: `PLAYWRIGHT.md`
- CI: `CI.md`

Quick Commands

- Run unit tests:

```bash
npm run test
```

- Run Playwright E2E:

```bash
npm run test:e2e
```

Building the docs site

This repository includes a simple MkDocs configuration. To build the site locally:

```bash
pip install mkdocs mkdocs-material
mkdocs serve
```

The site will be available at `http://127.0.0.1:8000` by default.
