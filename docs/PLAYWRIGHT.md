# Playwright E2E Guide

This project uses Playwright for end-to-end tests. Tests are under `e2e/`.

Running tests locally

```bash
# install browsers once
npx playwright install --with-deps

# run all tests
npm run test:e2e
```

Configuration notes
- Tests default to `http://localhost:3000`. Override with `BASE_URL`.
- Tests stub many backend endpoints using `page.route('**/api/*')` to keep them deterministic.
- For tests which need a real backend, ensure dev server is running: `npm run dev`.

Dev-time auth
- `pages/api/invite.ts` accepts `x-test-user` or `?test_user=` in non-production to bypass NextAuth.

Debugging failures
- Playwright writes test artifacts to `test-results/` and to `playwright-report` when configured.
- In CI we upload `playwright-report` as an artifact for inspection. Configure additional reporters in `playwright.config.ts` if needed.

Best practices
- Use `data-testid` attributes for stable selectors.
- Keep route interception in tests limited to the smallest scope (only the endpoints you need to control).
