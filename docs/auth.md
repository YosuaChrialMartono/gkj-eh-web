# Authentication

The application uses Auth.js with local database-backed credentials and an optional Google provider. The former NestJS auth proxy routes and `API_URL` clients are removed; they are not supported application endpoints.

## Sign-in and registration

- `auth.ts` configures Auth.js credentials and optional Google sign-in.
- `app/api/auth/[...nextauth]/route.ts` exposes Auth.js sign-in, callback, provider, and session handlers.
- The login form uses Auth.js `signIn("credentials", ...)` and refreshes the current user from `GET /api/auth/current`.
- Registration calls `registerAction` from `lib/server/auth/actions.ts`. `registerUser` validates and hashes credentials before inserting a local user; successful registration signs in through Auth.js.
- The Google button uses Auth.js's Google provider when its server environment variables are configured. It does not call a separate backend endpoint.

## Session and authorization

- Auth.js manages its own session cookie and JWT. No Nest access or refresh token is stored in the browser.
- `lib/server/auth/index.ts` reads the current Auth.js session and enforces application capabilities for server actions and routes.
- Session-version checks allow logout to revoke a copied/stale session. Logout increments the local user's version and calls Auth.js `signOut`.
- Dashboard pages and server operations authorize on the server; UI visibility is not the authorization boundary.

## Current auth endpoints

- `/api/auth/[...nextauth]`: Auth.js handlers, including credentials and optional Google flows.
- `/api/auth/current`: current local user for client auth-state synchronization.

There are no `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/refresh`, or custom `/api/auth/google` backend proxies. Do not restore duplicate BFF auth endpoints or configure `API_URL` for supported application flows.
