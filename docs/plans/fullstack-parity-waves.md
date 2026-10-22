# Full-stack parity waves: status and remaining delivery plan

**As of:** 2026-10-22
**Baseline inspected:** `origin/main` at `7c8ede55ac9009833c84bb473edfa6fc78777ea9`
**Implementation in flight:** [PR #15](https://github.com/YosuaChrialMartono/gkj-eh-web/pull/15), open against `main`; this plan does not change it.

## Purpose and status vocabulary

This is a status-aware continuation plan, not a second implementation of the broad migration in PR #14. PR #14's `docs/plans/backend-consolidation-plan.md` remains the architecture, data model, authorization, and broad phase reference. This document maps that plan to the current branch/PR state, calls out what remains after PR #15, and defines the acceptance and operations closeout needed before considering the NestJS backend retired.

- **Merged** means present in inspected `main` at the baseline commit above.
- **In PR #15** means present in its open diff/head; it is not yet merged and must not be counted as shipped.
- **Local-only** means found in local AO work branches/history but not independently merged to `main`; some such commits are incorporated in PR #15.
- **Outstanding** means not evidenced as complete by `main` or PR #15 and still needs explicit verification or implementation.
- Wave ownership below is a proposed division of work, not an assignment to a person or an existing tracker issue.

## Source-of-truth references

1. PR #14, [backend consolidation plan](https://github.com/YosuaChrialMartono/gkj-eh-web/blob/docs/backend-consolidation-plan/docs/plans/backend-consolidation-plan.md): target architecture, auth and role policy, schema direction, security requirements, and broad delivery strategy. PR #14 itself is open against `main` and is not part of the baseline.
2. `/home/yosua/.ao/data/artifacts/gkj-eh-web-2/next-steps-backlog.md`: detailed 19-item feature-parity inventory and proposed completion gates.
3. `/home/yosua/.ao/data/artifacts/gkj-eh-web-2/fullstack-agent-work-split.md`: Wave 0 / domain-worker / integrator boundaries and coordination rules.
4. PR #15's actual open diff and commit history, not its title alone. It includes foundation, CMS/media, reports/statistics, Pelayan, auth/session tests, bridge removal, documentation, and validation changes.

**Foundation handoff search:** no separate foundation handoff document was found in the current `main` tree, the local Wave 0 integration tree, or the listed `gkj-eh-web-2` artifacts. The implementation history does contain foundation commits (notably `5c3cb5f`), but that is not a substitute for a durable owner-reviewed handoff. Treat shared contracts and operational assumptions below as needing confirmation during PR review/closeout.

## Baseline and implementation map

| Capability / backlog items | `main` at baseline | PR #15 head | Remaining interpretation |
| --- | --- | --- | --- |
| Foundation: env validation, Drizzle schema/migration/seed, Auth.js credentials, local session and role helpers, action conventions (backlog 04–07) | Not present as the integrated local-persistence implementation; `main` is still the earlier Nest-backed app | In PR: `feat(foundation)` and schema/migration, auth actions/policy, fresh-DB integration coverage | Do not call it merged. Review the complete role/account-link policy and fresh database setup before accepting. |
| CMS reads/writes, public rendering, sanitization and media (08–10) | Nest-backed integration remains | In PR: local content service, route/action changes, sanitizer, media handling, content integration tests, dynamic public rendering | Review security and restart-persistence behavior; no separate CMS reimplementation is planned. |
| Reports, member projection and statistics (11–12) | Nest-backed integration remains | In PR: local report actions/queries, member projection, statistics, report pages and DB-backed CRUD/authorization tests | Print route and dispatch are implemented; native browser print-dialog behavior remains unverified. |
| Pelayan month reads and mutations (13–14; backlog parity umbrella 02) | Existing UI still depended on missing/legacy paths | In PR: local schedule query/actions, roles/people/services/assignments, concurrency/authorization tests and UI wiring | Review transaction, date/month edges, assignment clear/delete, and supported Node runtime compatibility. |
| Retire obsolete API bridge (15) | Active Nest/BFF dependencies remain | In PR: removes legacy auth/report/member routes and clients; retains Auth.js catch-all/current-session, content/media routes as applicable | Final runtime/reference audit must be repeated on the merged candidate; intentional routes must remain documented. |
| Test harness, CI and local acceptance (03, 16) | Existing tests and CI are not proof of full parity | In PR: integration/unit/E2E additions and `.github/workflows/foundation.yml`; author-reported local acceptance | CI must complete green on PR #15. Run the full final matrix again against the eventual release candidate. |
| Deployment, restore and backend retirement (17–18) | Not demonstrated | No production-equivalent deploy/restore or signed backend-retirement rehearsal is evidenced by the PR diff | Outstanding release work; see Waves 3–4. |
| Contributor/developer documentation (19) | Earlier setup docs | In PR: README/auth and historical-plan updates | Check that migration, seed, test, required env, storage and deployment instructions are coherent after merge. |
| Google sign-in | `main` has Google UI/provider integration against the earlier auth setup | Auth.js Google provider/config and UI are in PR | **Live OAuth callback is outstanding**; provider configuration in code is not live credential/redirect verification. |
| Title converter | Present in `main` and expected to remain local | Not a port target; auth/mobile E2E exercises it | Keep as a regression acceptance item; no new feature work planned. |

### Local-only history (not separate merged work)

The inspected local branches include `ao/implement-wave-0/integration`, `ao/cms-media/root`, `ao/reports-statistics/wave1`, `ao/pelayan-crud/root`, and the integration/root branches. Their domain commits (e.g. `5c3cb5f` foundation, `c80e2af` CMS/media, `c30713c` reports, `ec820d2` Pelayan) are incorporated through the open PR #15 history. Do not treat those branches as merged PRs or independent completed delivery. PR #15 head is `ao/wave2-integration/legacy-bridge-cleanup` at the time of this plan.

## Proposed remaining waves and order

### Wave 0 — shared foundation and domain ports: accept PR #15, do not duplicate

**Status:** In PR #15, not merged.
**Owner boundary:** Integrator owns shared DB schema/migrations, env/config, Auth.js, role/capability helpers, action/query conventions, package scripts/lockfile, CI and cross-domain integration. CMS, reports/statistics, and Pelayan domain changes are represented together in PR #15; any follow-up should be a narrow gap fix rather than restarting the split.

**Acceptance before counting this wave complete:**

- PR #15 is reviewed and merged through normal project governance; no plan here authorizes merging it.
- Its CI checks pass and the final diff still contains the full local persistence and feature work described in the table above.
- A fresh isolated PostgreSQL test database can migrate and seed; DB integration, unit, typecheck, lint, build and browser suites pass with `API_URL` unset.
- Auth/session and role checks are verified at server boundaries; report CRUD is DB-backed; Pelayan assignment concurrency and authorization tests pass; content draft/public isolation, sanitization and media checks pass.
- No test or command points at a shared/non-test database. Record results and any exceptions in the PR/release notes.

### Wave 1 — close product parity and external-provider verification

**Status:** Partially in PR #15; explicit live-provider and native-print verification remain.
**Owner boundary:** Release/acceptance owner coordinates; auth maintainer owns OAuth configuration, reports owner owns print workflow. Do not broaden the public API or restore legacy BFF routes absent a demonstrated consumer.

Tasks:

1. **Live Google OAuth:** configure the intended staging/production callback URL and secrets through the deployment secret manager; verify sign-in, first-time viewer creation, returning account behavior, safe account-link policy, cancellation/error paths, and sign-out. Confirm callback URLs and cookie/security settings in the deployed origin. Do not paste secrets into source, logs, or this plan.
2. **Native print:** use a real browser with the actual print dialog (not only a stubbed `window.print`) to verify report layout, page breaks, no dashboard chrome, readable output and save-to-PDF. Record browser/OS and outcome. Current evidence verifies route response and print dispatch only.
3. **Feature parity sweep:** walk the operation-level inventory below against the NestJS source/reference with the backend process stopped and `API_URL` unset. Record intentional behavior/security differences rather than silently marking them equivalent.
4. **Role matrix:** exercise anonymous/viewer/editor/admin cases for public content, dashboard reads, content writes, report reads/writes, Pelayan operations, uploads, role definitions and user role administration. Confirm denied operations fail closed.
5. **Regression:** verify title converter, mobile navigation/overflow, public news/sermons/article rendering, upload display, report stats and schedule boundaries with fresh fixtures.

**Exit evidence:** checked acceptance matrix with links to automated tests and brief manual evidence; live Google OAuth verified in intended environment; native print dialog verified or explicitly accepted as a known release exception by product owner.

### Wave 2 — deploy and recovery readiness

**Status:** Outstanding; PR #14 architecture is the design reference.
**Owner boundary:** deployment/operator owns host, systemd/reverse proxy, secrets, database/media volume, backup and restore; application integrator owns migration/health behavior and deployment documentation. No production-data migration is planned because the application is unreleased, per the backlog assumptions.

Tasks:

1. Confirm target is persistent Node + PostgreSQL + persistent media directory; if runtime is serverless, revise media storage to object storage before deploy.
2. Document required environment variables, secret provisioning/rotation, Node/package-manager versions, build/start commands, migration/seed policy, service account, writable media path and reverse-proxy routing.
3. Deploy a staging/host-equivalent instance from a clean checkout. Apply migrations explicitly; verify service restart, health/logging, DB connection and upload persistence across restart/rebuild.
4. Back up PostgreSQL and media together; perform and record a restore into an isolated environment. Verify restored uploads are reachable and report/content references remain valid.
5. Document rollback to the previous app artifact/configuration and DB recovery boundaries. Avoid destructive reset/seed commands against a non-test DB.
6. Ensure secrets, uploads, generated files and database artifacts are excluded from Git/build artifacts; confirm legacy credentials are rotated/removed where appropriate.

**Exit evidence:** runbook reviewed by operator, clean staging deployment and restart passed, backup/restore rehearsal passed, rollback steps are actionable.

### Wave 3 — final backend-off parity gate and retirement decision

**Status:** Outstanding release gate. The PR's bridge cleanup is code-level removal; it is not evidence that a deployed backend can be turned off safely.
**Owner boundary:** Integrator assembles evidence; domain owners resolve specific failures; product/operations owner signs off the retirement decision. Keep NestJS source available as a reference until signoff.

1. Start the candidate with the NestJS service stopped/unreachable and `API_URL` absent. Use a fresh migrated/seeded database and persistent media path.
2. Run clean install/lockfile validation, migrations, unit and DB integration tests, typecheck, lint, production build, all required E2E projects and the manual checks in Wave 1.
3. Search runtime source, tests and configuration separately for `API_URL`, backend origin/port, `Authorization: Bearer`, `refresh_token`, proxy helpers, obsolete route paths and old auth handlers. Classify historical documentation references; require zero executable dependencies.
4. Exercise all feature-parity rows below. Capture logs for errors, not secrets or tokens. Confirm failures are surfaced and are not silently rendered as empty data.
5. Verify persistence across application restart/rebuild, and recovery via the Wave 2 restore rehearsal.
6. Obtain explicit owner signoff before disabling/removing the backend service or credentials. Retain backend source for archaeology; no backend deletion is in scope for this plan.

**Exit evidence:** signed checklist, clean backend-off acceptance, no active bridge references, and operations signoff. If any item fails, keep backend retirement blocked and open a focused follow-up.

### Wave 4 — docs and maintenance closeout

**Status:** Partially in PR #15; finish after implementation and operational decisions stabilize.
**Owner boundary:** Integrator owns README/CLAUDE/docs and package hygiene; operators own environment-specific runbook values.

- Ensure a new contributor can clone, provision a disposable DB, migrate, seed, run checks and start locally using repository docs alone.
- Update the consolidation plan and parity status to link the merged implementation PRs and this release evidence; mark superseded Nest/BFF instructions historical rather than deleting useful context.
- Remove unused dependencies/scripts only when proven unused; keep lockfiles and package manager consistent.
- Keep environment-specific secrets, hosts, user identities and credential values out of committed docs.

## Feature-parity acceptance matrix

Use this as the release evidence index. PR #15 provides implementation/tests for most rows, but every row is **not merged until PR #15 is merged**, and end-to-end retirement acceptance remains outstanding.

| Capability | Expected local behavior | PR #15 evidence area | Final check |
| --- | --- | --- | --- |
| Credentials register/login/logout and current user | Auth.js/local registration, default viewer, revocable/validated session; protected current-user projection | `lib/server/auth/**`, `auth.ts`, Auth.js routes, `app/api/auth/current`, `tests/e2e/auth-session.spec.ts` | Test fresh registration, login, logout/revocation, invalid/expired session, role refresh, disabled-user handling. |
| Google authentication | Auth.js Google sign-in, safe linking and viewer defaults | Auth.js configuration, login page and Google provider setup | Live configured callback in target environment; test first-time and returning sign-in. |
| Content public/protected reads and CRUD | Published public content, private drafts/admin reads, validated writes, safe author projection and cache freshness | `lib/server/content/**`, content routes/pages, `tests/integration/content.test.ts` | Backend-off public and admin flows; draft leakage, slug conflict, XSS/sanitization, author privacy and cache invalidation. |
| Upload and public media | Authorized safe upload, same-origin serving, traversal-safe reads, persistent files | `lib/server/media.ts`, upload/media route and CMS UI | MIME/size/unsafe input rejection; image render after restart/rebuild; staging persistent-volume proof. |
| Reports and members | Authorized create/read/update/delete, validated full replacement, member names from Pelayan people | `lib/server/reports/**`, `lib/server/members.ts`, `tests/integration/reports.test.ts` | CRUD, authorization, field removal/identity integrity, member lookup and no proxy dependency. |
| Statistics | Protected aggregates from locally persisted reports, useful distinction between empty and failure | Statistics page and report query modules | Compare totals/charts to fixtures; induce a query failure and verify it is surfaced. |
| Pelayan roles/people/services/assignments | Month-scoped schedule and authorized CRUD/upsert/clear, bounded queries and concurrency-safe assignments | `lib/server/pelayan/**`, Pelayan UI, `tests/integration/pelayan.test.ts` | Month boundaries, extra services, custom people, assignment conflict/clear/delete and role matrix. |
| Title converter | Existing local song catalog/conversion behavior survives auth changes | Existing route and auth/mobile E2E | Run regression scenarios with backend stopped. |
| Print | Report print page and client dispatch | Report print route/button; local manual test dispatch | Native dialog and PDF output in real browser; dispatch alone is insufficient. |
| Migrations/seed/runtime | Fresh isolated DB setup and repeatable application startup | Drizzle migration/seed scripts, foundation integration tests, CI workflow | Clean checkout deploy and restore/restart rehearsal; never seed a non-test DB as part of tests. |

## Dependency and PR order

1. **PR #15** — review/merge its current foundation + all three domain slices + bridge cleanup as one integrated change; this document does not authorize merge. Fix CI/review findings there rather than creating duplicate ports.
2. **Focused parity follow-ups** — only for unmet Wave 1 rows (live OAuth setup/test, native print, missing edge cases). Keep unrelated deployment configuration out of app implementation PRs unless the code genuinely requires it.
3. **Operations/runbook change** — after the target runtime and deployment owner are confirmed; can proceed alongside the manual acceptance planning, but staging depends on an accepted PR #15 candidate.
4. **Backend-off release signoff** — depends on PR #15 being merged, Waves 1–2 passing, and a fresh full acceptance run. This is a decision gate, not an automatic backend deletion task.
5. **Docs/maintenance closeout** — update references after actual merge/deploy state is known; do not pre-label in-flight work merged.

For parallel work, follow `fullstack-agent-work-split.md`: one integrator owns shared schema/auth/config/CI/API cleanup and acceptance; domain workers own their domain seams and tests. Since those domain ports are already grouped in PR #15, any new worker should take only a bounded uncovered verification or operational task. No worker should independently edit shared schema/migrations or restore compatibility proxies without integrator coordination and an evidenced consumer.

## Risks and decisions to resolve

| Risk / decision | Why it matters | Mitigation / owner |
| --- | --- | --- |
| PR #15 is open and not in `main` | None of its implementation can be treated as shipped yet | Keep all status language conditional; rebase this map after merge. Integrator/reviewer. |
| Missing durable foundation handoff | Domain assumptions and stable seams may be implicit in code/history | During PR #15 review, record approved schema/auth/action contracts and remaining constraints in maintained project docs. Integrator. |
| Live Google OAuth unverified | Provider configuration can compile while callback, secrets, redirects, account linking or cookies fail in deployment | Wave 1 live test with managed secrets and intended domain. Auth/deployment owner. |
| Native print dialog unverified | `window.print()` dispatch does not establish actual print/PDF layout quality | Wave 1 real-browser manual test and evidence. Reports/release owner. |
| Host persistence and restore unproven | Local uploads and DB work can disappear or diverge after restart/restore | Wave 2 host-equivalent deploy and joint DB/media restore test. Operator. |
| Full backend parity may exceed visible screens | Hidden endpoints or legacy operations may be omitted despite UI tests passing | Walk backlog's full route inventory with Nest stopped and compare source operations. Integrator. |
| OAuth account-link policy | Unsafe email-based linking can grant access to the wrong identity | Require reviewed explicit provider-account linking behavior; do not assume email equality is sufficient. Auth owner. |
| Backend retirement confused with BFF deletion | Removing frontend proxies does not stop a backend process or prove no other caller | Search deployed traffic/config and obtain explicit operations signoff before retirement. Release owner. |
| CI/manual coverage gaps | Current local acceptance is not equivalent to provider checks or live environment checks | Wait for PR #15 CI; distinguish automated, local manual, and target-environment evidence in checklist. Integrator. |

## Current verification evidence and limitations

The PR #15 author reported local acceptance on an isolated `gkj_next_test` database with `API_URL` unset: DB integration 13/13, unit 17/17, auth/mobile E2E 14/14, typecheck and build passed, lint had zero errors and one existing warning, and diff check passed. Manual report UI create/edit/delete and print dispatch passed. This is **PR-head author evidence**, not merged-main evidence or deployment signoff; native print dialog and live Google OAuth remain unverified. Check the current PR's CI/review state before relying on it.

## Definition of done for the full-stack transition

- PR #15 and any required narrow follow-ups are merged and green.
- The parity matrix has a linked automated or manual evidence result for every capability, including Google OAuth and native print.
- A clean, fresh-DB deployment runs with the NestJS process stopped and `API_URL` absent; all persistent data/media survive restart and a restore rehearsal.
- No executable code/config/test requires NestJS, old auth routes, bearer-token refresh, or backend-origin URLs.
- A reviewed operator runbook covers deploy, migrations, secrets, health/logs, backup/restore and rollback.
- The owner explicitly signs the backend retirement decision. Until then, retain the backend source and do not claim full retirement.
