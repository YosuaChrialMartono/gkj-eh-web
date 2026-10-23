# Backend Consolidation Phase 0 Baseline

Captured on 2026-09-27 before the Phase 0 safeguards were added.

## Commands

| Command         | Result        | Notes                                                                                                  |
| --------------- | ------------- | ------------------------------------------------------------------------------------------------------ |
| `pnpm lint`     | Passed        | Existing frontend lint completed without errors.                                                       |
| `pnpm build`    | Passed        | Next.js production build completed successfully.                                                       |
| `pnpm test:e2e` | Blocked       | Playwright found 18 tests but could not launch them because the Chromium executable was not installed. |
| `pnpm test`     | Not available | No unit/integration test script or runner existed.                                                     |

## Current integration inventory

- `gkj-eh-web` still depends on `API_URL` and the Nest BFF/client layer.
- The local environment contains `API_URL=http://localhost:8080`.
- Browser mutations still use the `refresh_token` cookie and bearer access tokens.
- The sibling `../gkj-eh-be` repository is still the runtime owner of PostgreSQL access.

Run `pnpm inventory:backend` to regenerate the complete reference inventory while the bridge remains in place.

## Phase 0 verification

After the safeguards were added, formatting, linting, Vitest, and the production build
all passed. Playwright launched successfully after installing Chromium: 6 tests passed
and 12 authenticated/persistence tests failed because the expected Nest service was not
running on `localhost:8080`. Those failures are expected until the later consolidation
phases replace the backend dependency.

## Phase 0 exit criteria

- Vitest is available through `pnpm test` for server-module tests.
- `.env.example` documents non-secret current and target variables.
- `pnpm verify` runs formatting, linting, unit/integration tests, the production build, and Playwright.
- Legacy backend references have a reproducible inventory command and are intentionally not removed until later migration phases.
