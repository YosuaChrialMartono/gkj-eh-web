# Register Page Design

**Date:** 2026-04-03

## Overview

Add a registration page to the GKJ Eben Haezer web app at `app/(auth)/register/page.tsx`, mirroring the existing login page structure. Also extend `AuthContext` with a `register()` method to keep all auth operations centralized.

## Auth Context Changes

Add `register(name: string, email: string, password: string): Promise<void>` to `AuthContextValue` and implement it in `AuthProvider`:

1. Call `POST /api/auth/register` with `{ name, email, password }`
2. On success, set `user` and `accessToken` state (auto-login — no redirect to login page needed)
3. On failure, throw an `Error` with the message from the response (same pattern as `login()`)

## Register Page

**File:** `app/(auth)/register/page.tsx`

**Structure:** Mirrors `login/page.tsx` exactly — a `RegisterForm` component wrapped in `<Suspense>` exported as the default page.

**Form fields:**
- Name (text input, `autoComplete="name"`)
- Email (email input, `autoComplete="email"`)
- Password (password input, `autoComplete="new-password"`)
- Confirm Password (password input, `autoComplete="new-password"`)

**Validation:** Client-side check that password === confirm password before calling the API. Displays an inline error if they don't match (no API call made). Uses the same `text-sm text-destructive` pattern as the login error.

**On success:** Call `register()` from `useAuth()`, then redirect to `/dashboard`.

**On failure:** Display the thrown error message inline (same as login).

**Footer link:** "Already have an account? Sign in" linking to `/login`, rendered below the submit button.

**Card content:**
- Title: "GKJ Eben Haezer"
- Description: "Create your account"
- Submit button label: "Create Account" / "Creating account..." while loading

## What Is Not Changing

- The login page is not modified (no "Register" link added to it — out of scope)
- No email verification flow
- No password strength indicator
