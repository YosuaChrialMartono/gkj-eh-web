# Backend Consolidation Plan

## Status

- Target repository: `gkj-eh-web` (the repository will not be renamed)
- Source to retire: sibling `gkj-eh-be`
- Target runtime: one Next.js Node service on the current Ubuntu host, managed by systemd
- Persistence: existing PostgreSQL server, reset to a new Drizzle-managed schema
- Authentication: Auth.js with credentials and Google providers
- Mutations: Server Actions
- Uploads: persistent local volume
- Cutover: no production traffic or data to preserve

This plan migrates every runtime capability currently supplied by `gkj-eh-be` into
`gkj-eh-web`, removes every frontend dependency on `API_URL`, and then retires the
NestJS process. It intentionally does not migrate existing database rows, sessions,
or uploaded files.

## Goals

1. Make `gkj-eh-web` the only application process.
2. Preserve the current user-facing CMS, reports, statistics, public content, and
   pelayan workflows.
3. Replace backend HTTP calls with server-only modules and direct database access.
4. Replace the access-token/refresh-token bridge with Auth.js sessions.
5. Define and enforce authorization on the server.
6. Manage the PostgreSQL schema exclusively through checked-in Drizzle migrations.
7. Store uploads outside the repository in a persistent, backed-up host directory.
8. Fix known security and contract defects instead of reproducing them.
9. Delete obsolete BFF proxies, backend clients, environment variables, tests, and
   operational dependencies.

## Non-Goals

- Migrating rows, UUIDs, password hashes, JWT sessions, or files from `gkj-eh-be`.
- Keeping the NestJS API available for external consumers.
- Preserving the old `/auth`, `/content`, `/pelayan`, `/reports`, `/members`, or
  `/uploads` HTTP contracts.
- Renaming `gkj-eh-web` to `gkj-eh-fe`.
- Moving the deployment to Vercel, containers, or object storage.
- Adding invitations, audit history, soft deletion, or zero-downtime dual writes.

## Current Dependency Inventory

The migration is complete only when every item in this section is removed or
replaced.

### Backend capabilities to replace

| Area | Current backend responsibility | Target owner |
| --- | --- | --- |
| Auth | Register, credentials login, Google token verification, JWT refresh/logout | Auth.js plus server-side registration |
| Users | User records, bcrypt hashes, names, avatars, free-text roles | Drizzle schema and auth service |
| Content | Public/protected queries, CRUD, pagination, filtering, slug uniqueness | Content repository/service and actions |
| Reports | CRUD, JSONB persistence, flattening, list used by statistics | Reports repository/service and actions |
| Pelayan | Roles, people, services, assignments, assignment upsert | Pelayan repository/service and actions |
| Members | Names projected from pelayan people | Pelayan repository query |
| Uploads | Multipart validation, local disk writes, public static files | Upload action and same-origin media route |
| Database | TypeORM entities and `synchronize: true` | Drizzle schema and versioned migrations |
| Configuration | YAML DB/JWT/CORS/server configuration | Validated environment variables |
| Runtime | NestJS service on port 8082 | Removed after cutover |

### Frontend dependencies to replace

| Current path | Dependency | Replacement |
| --- | --- | --- |
| `lib/api/client.ts` | Builds requests from `API_URL` | Delete; server modules call repositories |
| `lib/api/proxy.ts` | Exchanges refresh JWT and proxies requests | Delete |
| `lib/api/auth.ts` | Calls NestJS auth routes | Delete; use Auth.js APIs/actions |
| `lib/auth/server-utils.ts` | Mints backend access tokens | Replace with `auth()` and authorization helpers |
| `lib/auth/auth-context.tsx` | Stores access token and refreshes globally | Replace with Auth.js session integration |
| `lib/api/content.ts` | Direct protected/public backend calls | Replace reads with server-only content queries |
| `lib/api/pelayan.ts` | Direct backend calls | Replace reads with server-only schedule queries |
| `lib/api/reports-server.ts` | Direct backend calls | Replace with server-only report queries |
| `lib/api/reports.ts` | Calls report/member BFF routes | Replace mutations with actions and reads with props |
| `app/api/auth/*` | Custom JWT-cookie bridge | Replace with Auth.js catch-all handler; remove refresh route |
| `app/api/content/*` | Content BFF | Replace with content actions, then delete |
| `app/api/reports/*` | Reports BFF | Replace with report actions, then delete |
| `app/api/members/route.ts` | Members BFF | Load people directly on the server |
| `app/api/upload/route.ts` | Upload proxy and backend URL rewriting | Replace with local upload action |
| Pelayan components | Call missing `/api/pelayan/*` routes with bearer tokens | Call protected pelayan actions |
| `.env.local` | Defines `API_URL=http://localhost:8082` | Remove `API_URL`; add DB/auth/upload variables |
| Public image data | May contain backend-origin upload URLs | Fresh reset means no rewrite is needed |
| E2E tests | Assume `/api/reports` and a live backend | Rewrite around UI/actions and the new database |
| Documentation | Describes NestJS, JWT refresh, and BFF paths | Rewrite after consolidation |

## Target Architecture

```text
Browser
  |-- public pages --------------------------+
  |-- Auth.js requests ----------------------+-- Next.js Node service
  |-- Server Actions (authenticated writes) -+      |
                                                     |-- auth() / requireUser()
Server Components ----------------------------------|-- domain services
                                                     |-- Drizzle repositories
                                                     |       |
                                                     |    PostgreSQL
                                                     |
                                                     +-- persistent upload directory
                                                          exposed as /media/<file>
```

Rules for the target code:

- Only server-only modules import the database client, password hashing, Auth.js
  configuration, or filesystem storage.
- Server Components call query functions directly. They do not call this app over
  HTTP.
- Client Components mutate through Server Actions. Actions authenticate, authorize,
  validate, call a service, invalidate affected paths/tags, and return a typed result.
- Services own business rules and transaction boundaries. Repositories own Drizzle
  queries. React components do not issue SQL.
- Auth.js HTTP handlers are the only required application API handlers. `/media/*`
  may be a Route Handler or be served directly by the host reverse proxy.
- Public content caching uses tags. Content actions invalidate the affected content
  list and slug tags immediately.

## Authorization Policy

Roles are a database enum: `admin`, `editor`, and `viewer`.

| Capability | Anonymous | Viewer | Editor | Admin |
| --- | --- | --- | --- | --- |
| Read published content | Yes | Yes | Yes | Yes |
| Read dashboard/content drafts/reports/schedules | No | Yes | Yes | Yes |
| Create/update/delete content | No | No | Yes | Yes |
| Create/update/delete reports | No | No | Yes | Yes |
| Manage service dates and assignments | No | No | Yes | Yes |
| Upload media | No | No | Yes | Yes |
| Manage pelayan people | No | No | Yes | Yes |
| Manage pelayan role definitions/order | No | No | No | Yes |
| Manage user roles/accounts | No | No | No | Yes |

Public email/password registration and first-time Google sign-in create `viewer`
users. Authorization is enforced in every action and protected query, never only in
the UI. `requireUser()` reloads the user from PostgreSQL on protected operations so a
role change or account disablement takes effect without waiting for the session JWT
to expire.

## Target Data Model

Use Drizzle PostgreSQL schema declarations as the source of truth. Generate and
commit SQL migrations; do not use schema push or runtime synchronization outside an
explicit disposable development workflow.

### Auth tables

- `users`
  - UUID primary key
  - normalized unique email
  - name
  - nullable password hash for credentials login
  - nullable image URL
  - role enum, default `viewer`
  - disabled timestamp, nullable
  - created/updated timestamps
- `accounts`
  - Auth.js provider account linkage for Google
  - unique provider/provider-account ID
  - foreign key to users with cascade delete
- `verification_tokens`
  - Auth.js-compatible token table, even if initially unused

Use Auth.js JWT sessions because the Credentials provider does not create a database
session for a credentials user. Put only the user ID and a display-time role in the
JWT; protected operations still reload the user. Configure a 30-day maximum age.
Do not carry forward backend access or refresh JWTs.

### Domain tables

- `content`
  - UUID primary key
  - unique slug
  - type enum: `article`, `sermon`, `announcement`
  - status enum: `draft`, `published`
  - title, canonical Tiptap JSON, sanitized HTML
  - optional featured image URL and publication timestamp
  - author foreign key to users
  - created/updated timestamps
  - indexes for status/type/publication date and author
- `pelayan_roles`
  - UUID primary key, unique name, integer display order
- `pelayan_people`
  - UUID primary key, unique normalized name plus display name
- `pelayan_services`
  - UUID primary key, date, optional label, `is_extra`
  - unique date/label identity suitable for materializing virtual Sundays once
- `pelayan_assignments`
  - UUID primary key
  - service, role, and person foreign keys
  - unique `(service_id, role_id)`
  - cascade when a service or role is deleted; restrict deletion of assigned people
- `reports`
  - UUID primary key
  - service date and service type
  - validated report payload in JSONB
  - created/updated timestamps and creator/updater user IDs
  - index on service date

Assignments become relational rather than retaining free-text person names. A custom
name entered from the schedule UI creates or resolves a person in the same
transaction before upserting the assignment. `/members` remains a projection of
pelayan people rather than becoming a separate domain.

The report payload remains JSONB to minimize form churn, but is validated with the
shared Zod schema before every write. Core IDs/timestamps cannot be overwritten by
payload keys. Updates replace the complete validated payload, eliminating the old
shallow-merge behavior that made keys impossible to remove.

## Validation and Security Baseline

- Define shared Zod schemas for every action input and query filter.
- Normalize emails with trim plus lowercase before lookup and uniqueness checks.
- Hash credentials passwords with the existing bcrypt-compatible algorithm and cost
  or a documented stronger replacement; never select hashes in ordinary user reads.
- Require passwords of at least 8 characters and cap all user-controlled strings.
- Validate UUIDs, real calendar dates, enums, pagination bounds, slugs, and URLs.
- Sanitize generated HTML server-side before storage. Keep Tiptap JSON canonical and
  regenerate sanitized HTML on writes.
- Reject SVG and claimed MIME types that do not match inspected file bytes.
- Limit uploads to JPEG, PNG, WebP, and GIF at 5 MiB.
- Generate opaque UUID filenames; never use a user-supplied path or extension.
- Restrict post-login redirects to same-origin paths beginning with a single `/`.
- Rely on Auth.js and Next.js same-origin protections, and verify every mutation is a
  Server Action reached from the application. Do not expose generic unauthenticated
  mutation handlers.
- Return deliberate `notFound`, unauthenticated, unauthorized, validation, conflict,
  and internal-error outcomes. Stop converting unexpected protected-data failures
  into empty arrays.
- Never commit `DATABASE_URL`, `AUTH_SECRET`, Google secrets, or deployment values.

## Delivery Strategy

Implement vertical slices behind the existing UI rather than creating a second app.
Each phase must leave the repository buildable. Because there is no production data,
the database may be reset repeatedly during development and there is no old/new data
copy or dual-write period.

### Phase 0: Baseline and safeguards

1. Create a feature branch for implementation.
2. Record baseline results for `pnpm lint`, `pnpm build`, and `pnpm test:e2e`.
3. Add a unit/integration test runner suitable for server modules.
4. Add `.env.example` with non-secret variable names and document local setup.
5. Add a CI or local verification script that runs formatting/linting, type/build,
   unit/integration tests, and Playwright.
6. Inventory all current `API_URL`, backend path, bearer token, `refresh_token`, and
   backend-origin URL references with a checked command so the final deletion gate is
   reproducible.

Exit criteria:

- Baseline failures are documented rather than silently accepted.
- The repository has one command sequence that verifies the migration.

### Phase 1: Drizzle foundation and fresh schema

1. Add `drizzle-orm`, `drizzle-kit`, `postgres` (or `pg`), and required development
   dependencies.
2. Add validated server environment configuration for:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
   - `UPLOAD_DIR`
   - optional `AUTH_TRUST_HOST`/public origin required by the deployment
3. Add a singleton server-only database client that survives Next.js development
   reloads without opening unbounded connections.
4. Declare all auth and domain tables, enums, constraints, relations, and indexes.
5. Generate and commit the initial SQL migration.
6. Add migration and seed scripts to `package.json`.
7. Seed one admin, representative viewer/editor accounts, content, reports, roles,
   people, services, and assignments without hard-coding production passwords.
8. Add database integration tests for uniqueness, foreign keys, cascade/restrict
   behavior, dates, and assignment upsert concurrency.

Exit criteria:

- An empty database can be created solely by running committed migrations.
- Seed data renders all major UI states.
- No code imports TypeORM or reads `gkj-eh-be/config.yaml`.

### Phase 2: Auth.js and authorization

1. Configure Auth.js with the Drizzle adapter, Google provider, Credentials provider,
   JWT session strategy, and custom sign-in page.
2. Implement credentials verification against normalized email and password hash.
3. Implement registration as a protected server-side service exposed to the public
   registration form; it always creates a viewer and handles duplicate email safely.
4. Configure Google sign-in so a new verified Google identity creates a viewer.
   Require explicit account linking for an existing credentials email; do not enable
   dangerous automatic email linking.
5. Add session callbacks exposing only `id`, `name`, `email`, `image`, and role.
6. Add `requireUser()` and `requireRole(...roles)` helpers that reload users and reject
   disabled accounts.
7. Replace the dashboard cookie-presence gate with an actual Auth.js session check.
8. Replace `AuthProvider` access-token state with Auth.js `SessionProvider` only where
   client session state is needed; prefer passing server session data as props.
9. Convert login, registration, Google login, logout, redirects, sidebar identity,
   and expired-session handling.
10. Remove the custom login/register/Google/refresh/logout BFF routes superseded by
    Auth.js. There is no replacement refresh endpoint or `refresh_token` cookie.
11. Add tests for credentials, Google account policy at the service boundary,
    registration, disabled users, role enforcement, safe redirects, and logout.

Exit criteria:

- Email/password and Google login work without `gkj-eh-be`.
- Registration creates only viewers.
- A fabricated/stale cookie cannot enter protected pages.
- Viewer/editor/admin permissions match the authorization table.

### Phase 3: Content vertical slice

1. Implement server-only content list/detail/public-slug queries with bounded
   pagination, search, filters, deterministic ordering, and projected author data.
2. Implement create/update/delete services with slug conflicts, publication rules,
   author attribution, Tiptap JSON validation, and HTML sanitization.
3. Add protected content Server Actions and tag/path invalidation.
4. Move public pages, dashboard counts/table, and edit pages from `lib/api/content.ts`
   to direct server queries.
5. Move content form and deletion UI from `/api/content*` fetches to actions with
   field-level errors and pending states.
6. Keep public content caching at 60 seconds as a fallback, but invalidate it
   immediately after mutations.
7. Delete the content BFF route handlers and obsolete content API functions.
8. Add tests for public visibility, draft protection, filtering, pagination, author
   projection, duplicate slug, sanitization, RBAC, and cache invalidation calls.

Exit criteria:

- Public and dashboard content features work with the NestJS service stopped.
- Password hashes or private user fields can never appear in content responses.
- Content types used by the UI and database are identical.

### Phase 4: Upload and media storage

1. Define `UPLOAD_DIR` as an absolute host path outside the repository, for example
   `/var/lib/gkj-eh-web/uploads`.
2. Add a storage module that validates size, sniffs file bytes, allows only the four
   approved raster formats, creates UUID filenames, writes atomically, and returns a
   stable same-origin `/media/<filename>` URL.
3. Expose media read-only through a traversal-safe Route Handler or reverse-proxy
   alias. Set correct content type, `nosniff`, cache, and content-disposition headers.
4. Replace `/api/upload` calls in the content image picker and both Tiptap upload paths
   with the upload Server Action.
5. Add orphan cleanup policy: do not delete synchronously on content edits; add a
   maintenance command that removes unreferenced files after a grace period.
6. Add filesystem tests for MIME spoofing, SVG rejection, limits, traversal, atomic
   writes, missing files, and authorization.
7. Document backup/restore for both PostgreSQL and `UPLOAD_DIR`.

Exit criteria:

- New uploads survive application rebuilds and restarts.
- Media URLs do not contain port 8082 or depend on `API_URL`.
- Only admin/editor users can upload; media reads remain public.

### Phase 5: Reports and statistics vertical slice

1. Reuse one report Zod schema on client and server, separating create/update input
   from persisted metadata.
2. Implement report queries and complete-payload create/update/delete transactions.
3. Implement protected report Server Actions with admin/editor writes and viewer
   reads.
4. Replace report list/detail/edit/new/print/statistics backend calls with direct
   server queries.
5. Replace report form `/api/reports*` writes with actions and explicit validation
   feedback.
6. Load member names directly from pelayan people; delete `/api/members`.
7. Replace the backend-contract Playwright test with user-visible persistence tests
   against the consolidated app and test database.
8. Add tests proving payload keys cannot overwrite IDs/timestamps and removed fields
   do not survive updates.

Exit criteria:

- Report CRUD, print, member suggestions, and statistics work with no backend HTTP.
- No report API compatibility layer remains solely for old tests.

### Phase 6: Pelayan vertical slice

1. Implement role, people, service, and assignment repositories.
2. Add one monthly schedule query that returns roles, people, services, and nested
   assignments, eliminating the current N+1 assignment requests.
3. Implement the intended month filter and deterministic role/service ordering.
4. Implement transactional service materialization plus assignment upsert using the
   `(service_id, role_id)` constraint.
5. Resolve or create custom people transactionally; render assignments from person
   relations.
6. Implement protected actions for people, services, assignments, and admin-only role
   definition/reordering.
7. Convert all pelayan dialogs/cells/role manager from direct fetch and bearer headers
   to actions. Ensure every failed mutation is surfaced to the user.
8. Define clearing an assignment as deletion, rather than silently ignoring a blank
   value.
9. Replace pelayan page, role page, and dashboard schedule reads with direct composite
   queries.
10. Delete `lib/api/pelayan.ts`.
11. Add tests for month boundaries, virtual Sundays, extra services, role reordering,
    assignment clearing, person deletion restrictions, concurrent upsert, and RBAC.

Exit criteria:

- Every currently broken `/api/pelayan/*` browser mutation works through an action.
- A monthly schedule is loaded with a bounded number of database queries.

### Phase 7: Remove the backend integration layer

1. Delete unused API client/proxy modules and their barrel exports.
2. Delete all superseded BFF handlers and custom refresh-token code.
3. Remove browser access-token state and every `Authorization: Bearer` construction.
4. Remove `API_URL` from local/deployment environment and configuration docs.
5. Remove backend-origin URL concatenation and assumptions.
6. Search source, tests, docs, service definitions, and scripts for:
   - `API_URL`
   - `localhost:8082`, `localhost:8080`, and backend production origins
   - `gkj-eh-be`
   - `/auth/refresh` and `refresh_token`
   - `Authorization`/`Bearer` used for the retired API
   - direct `/content`, `/pelayan`, `/reports`, `/members`, and `/uploads` upstream paths
7. Classify any remaining documentation-only historical references explicitly; remove
   all runtime references.
8. Remove dependencies that became unused and regenerate the lockfile.

Exit criteria:

- The app starts, builds, and passes tests with `gkj-eh-be` stopped.
- Unsetting `API_URL` has no effect.
- No source code can make a request to the retired backend.

### Phase 8: Systemd deployment and backend retirement

1. Add a versioned deployment template or runbook for the consolidated Next.js
   service, including working directory, Node/pnpm path, environment file, restart
   policy, and startup command.
2. Configure the service account and create the persistent upload directory with the
   minimum writable permissions. Restrict systemd write access to that path.
3. Run Drizzle migrations as an explicit pre-deploy step, not concurrently in every
   application worker.
4. Add a lightweight health endpoint that verifies the application and database
   without exposing secrets.
5. Configure logs, rotation/retention, process restart, and startup after PostgreSQL.
6. Update the reverse proxy/Cloudflare origin so only the Next.js service is needed
   and `/media/*` is reachable.
7. Back up the fresh database and upload directory and test restore instructions.
8. Stop and disable `gkj-eh-be.service`; remove `gkj-eh-web.service` ordering on it.
9. Keep the backend repository available temporarily for code archaeology, but mark
   it archived/read-only and remove it from deployment documentation.
10. Remove or rotate the old JWT secret and obsolete backend database credentials.

Exit criteria:

- Rebooting the host starts a fully functional site without `gkj-eh-be.service`.
- The backend port is closed and no monitor/reverse proxy depends on it.
- Database and media restore procedures have been exercised once.

### Phase 9: Documentation and final acceptance

1. Rewrite `README.md` and `CLAUDE.md` to describe Drizzle, Auth.js, Server Actions,
   PostgreSQL migrations, persistent uploads, and deployment.
2. Remove or clearly archive stale auth/CMS/backend plans and todo documents.
3. Document the role matrix, registration behavior, Google account-linking policy,
   schema migration workflow, seeding, backups, and media cleanup.
4. Run the complete verification matrix below.
5. Perform a clean-machine rehearsal from clone, environment creation, database
   migration, seed, build, start, and smoke tests.

Exit criteria:

- A contributor can set up the full application without opening `gkj-eh-be`.
- All acceptance scenarios pass on the deployment-equivalent Node runtime.

## Verification Matrix

### Automated

- Lint and TypeScript/Next production build.
- Unit tests for schemas, authorization, sanitization, and domain rules.
- PostgreSQL integration tests for every repository and transaction.
- Auth tests for credentials, Google policy boundary, registration, session, logout,
  disabled users, and all three roles.
- Upload tests against a temporary filesystem directory.
- Playwright tests for:
  - public homepage/news/sermons/article rendering
  - register, login, logout, and dashboard protection
  - viewer read-only behavior
  - editor content/report/schedule workflows
  - admin pelayan-role management
  - content image upload and rendering
  - report create/edit/delete/print/statistics
  - schedule service/assignment create/update/clear
  - mobile layouts already covered by the current suite
- A static search gate proving retired backend references are absent from runtime code.

### Manual deployment checks

1. Start with `gkj-eh-be.service` stopped.
2. Register a viewer and verify all write controls and actions are denied.
3. Log in as editor and complete content, report, schedule, and upload workflows.
4. Log in as admin and manage pelayan role definitions.
5. Restart and rebuild the Next.js service; verify data and uploaded media persist.
6. Reboot the host; verify Next.js, PostgreSQL connectivity, login, and media.
7. Restore PostgreSQL and media into a test location and verify the restored app.
8. Confirm no requests, logs, DNS routes, firewall rules, or service dependencies point
   to backend port 8082.

## Rollback

There is no production data migration and no dual-write requirement. Rollback during
implementation is therefore code-and-schema based:

1. Before each schema migration, take a PostgreSQL backup in environments containing
   useful test data.
2. Deploy application code only after its required migration succeeds.
3. If deployment validation fails, restore the database backup and redeploy the last
   known-good Next.js commit.
4. Do not use `drizzle-kit push` as a rollback mechanism.
5. Keep `gkj-eh-be` available only until final acceptance; it is not the data rollback
   target because the new environment starts fresh.

## Work Breakdown and Ordering

The critical path is:

```text
Drizzle schema
  -> Auth.js + authorization
  -> content + uploads
  -> reports
  -> pelayan
  -> integration deletion
  -> systemd cutover
  -> backend retirement
```

After the schema and authorization helpers are stable, content, reports, and pelayan
can be implemented as separate branches, but each must use the same action result,
validation, repository, and authorization conventions. Upload work blocks final
content acceptance. Pelayan people block report member suggestions.

Suggested review units:

1. Database foundation and migrations.
2. Auth.js, registration, and authorization.
3. Content reads/writes and cache invalidation.
4. Persistent uploads and media serving.
5. Reports, member projection, and statistics.
6. Pelayan composite queries and mutations.
7. Backend integration deletion and dependency cleanup.
8. Deployment, documentation, and backend retirement.

Do not combine all implementation into one merge request. Every review unit should
include its tests and leave both old and newly migrated slices functional until Phase
7 deliberately removes the remaining bridge.

## Definition of Done

- `gkj-eh-web` is the only application repository and running application service.
- All seven old backend data areas have Drizzle-owned equivalents.
- All reads use server-only queries; all interactive writes use protected Server
  Actions.
- Auth.js supports credentials and Google; public registration creates viewers.
- Server-side RBAC matches the approved policy.
- PostgreSQL can be initialized from committed migrations and seed scripts.
- Uploads live in the configured persistent directory and are served from same-origin
  stable URLs.
- Known password exposure, missing RBAC, SVG, HTML injection, validation, filter,
  assignment upsert, and silent-error defects are fixed.
- No runtime reference to `API_URL`, backend URLs, refresh JWTs, bearer access tokens,
  or NestJS remains.
- All automated and deployment checks pass with `gkj-eh-be` stopped and disabled.
- Documentation and operational runbooks describe only the consolidated system.
