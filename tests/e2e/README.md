# E2E / Responsive tests

These tests use Playwright and require a test Spotify account to be available via env variables.

Required env variables:
- TEST_SPOTIFY_ACCESS_TOKEN — a valid Spotify access token for a test account
- TEST_SPOTIFY_ME_JSON — the JSON-stringified Spotify `me` object (example: `{"id":"user123","display_name":"Test"}`)

Install and run locally:

1) Install Playwright test runner:
   npm i -D @playwright/test

2) Install the browsers (recommended):
   npx playwright install --with-deps

3) Run tests:
   TEST_SPOTIFY_ACCESS_TOKEN="<token>" TEST_SPOTIFY_ME_JSON='{"id":"...","display_name":"..."}' npm run test:e2e

Notes:
- Tests set the Pinia persisted auth store (`beardify-auth`) via localStorage before the app is loaded.
- Prefer using a short-lived test access token and do not commit secrets to the repo.

CI / GitHub Actions
- A workflow has been added at `.github/workflows/playwright-e2e.yml` to run Playwright on pull requests and pushes to `master`.
- The workflow expects two repository **secrets** to be configured in Settings → Secrets:
  - `TEST_SPOTIFY_ACCESS_TOKEN` — a Spotify access token for a test account
  - `TEST_SPOTIFY_ME_JSON` — JSON string of the Spotify `me` object (e.g. `{"id":"...","display_name":"..."}`)
- If the secrets are not present, authenticated route tests will be skipped; public responsiveness and snapshot tests will still run.
