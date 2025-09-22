# Testing Guide

This project includes unit tests (Vitest) and end-to-end tests (Playwright).

Unit tests (Vitest)
- Run unit tests:

```bash
npm run test
```

- Run in watch mode:

```bash
npm run test:watch
```

- Tests live in the `test/` directory.

End-to-end tests (Playwright)

- Install browsers (only needed once):

```bash
npx playwright install --with-deps
```

- Run Playwright E2E locally:

```bash
npm run test:e2e
```

- By default E2E tests run against `http://localhost:3000`. Set `BASE_URL` to a different value to target another host.

Dev-time authentication for E2E
- `pages/api/invite.ts` supports a dev-only bypass via `x-test-user` header or `?test_user=` query param when `NODE_ENV !== 'production'`.
- Tests in `e2e/` currently stub API responses using `page.route('**/api/*')` for deterministic behavior.

Troubleshooting
- If E2E tests fail with timeouts, increase Playwright timeouts with `--timeout` or adjust the test file waits.
- Playwright traces can be enabled by setting the `PLAYWRIGHT_TRACE` environment variable or configuring the Playwright config.

Playwright reports
- CI uploads the `playwright-report` artifact on every run. Use that artifact to inspect traces and videos for failures.
