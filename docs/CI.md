# CI Configuration (GitHub Actions)

The repository includes a CI workflow at `.github/workflows/ci.yml` with two jobs:

1. `build` — installs, generates Prisma client, builds, and runs unit tests.
2. `e2e` — runs Playwright E2E tests and uploads the `playwright-report` artifact.

Notes and tips
- The `e2e` job currently runs after `build` and starts a server via `npm run start`. It installs Playwright browsers and runs `npx playwright test`.
- The `e2e` job uploads `playwright-report` on every run to help with debugging failures.

Artifact locations and troubleshooting

- Playwright report artifact path (uploaded by CI): `playwright-report/`
- Playwright test-results (Playwright stores `.zip` or `test-results/` depending on config): `test-results/` or `playwright-report/` inside the artifact ZIP.

Downloading artifacts from a failed GitHub Actions run

1. On the run page, expand the "Artifacts" section and download `playwright-artifacts`.
2. Unzip locally and inspect `playwright-report/index.html` for traces and test results.

Example: download and open locally

```bash
# from the artifacts ZIP expand
unzip playwright-artifacts.zip -d playwright-artifacts
open playwright-artifacts/playwright-report/index.html
```

If Playwright traces were enabled, you'll see a `trace.zip` or `trace/` directories with per-test traces. Use Playwright CLI to open traces:

```bash
npx playwright show-trace playwright-report/traces/<trace-file>
```

CI improvements

- Consider enabling Playwright HTML reporter and video recording for failed tests to make debugging faster.
- Add a server health-check step before running Playwright so the job waits until `http://localhost:3000` is responsive.

Improvements you may want to add
- Add a health check that waits for the server to be ready before running Playwright.
- Make the `e2e` job conditional to run only on `pull_request` or when specific secrets are present.
- Configure Playwright to record traces and videos for failing tests and upload those files in CI.
