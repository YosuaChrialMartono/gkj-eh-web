# Google Login — Re-implementation Reference

Disabled on 2026-02-28. The BFF route (`app/api/auth/google/route.ts`) is already in place.
Re-enable once a Google Cloud project and OAuth Client ID are ready.

---

## 1. Install dependency

```bash
pnpm add @react-oauth/google
```

---

## 2. Environment variable

Add to `.env.local` (and keep in `.env.example`):

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
```

---

## 3. `app/layout.tsx` — wrap with `GoogleOAuthProvider`

```tsx
import { GoogleOAuthProvider } from "@react-oauth/google"

// wrap the existing ThemeProvider:
<GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
  <ThemeProvider ...>
    <AuthProvider>
      {children}
    </AuthProvider>
    <Toaster />
  </ThemeProvider>
</GoogleOAuthProvider>
```

---

## 4. `lib/auth/auth-context.tsx` — add `loginWithGoogle`

Add to `AuthContextValue` interface:

```ts
loginWithGoogle: (accessToken: string) => Promise<void>
```

Add implementation alongside the existing `login` callback:

```ts
const loginWithGoogle = useCallback(async (accessToken: string) => {
  const res = await fetch("/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: accessToken }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Google login failed" }))
    throw new Error(err.message ?? "Google login failed")
  }
  const data = await res.json() as { user: User; accessToken: string }
  setUser(data.user)
  setAccessToken(data.accessToken)
}, [])
```

Include it in the context value:

```ts
<AuthContext value={{ user, accessToken, isLoading, login, loginWithGoogle, logout, refreshAuth }}>
```

---

## 5. `app/(auth)/login/page.tsx` — add Google button

Add imports:

```ts
import { useGoogleLogin } from "@react-oauth/google"
```

Destructure from `useAuth()`:

```ts
const { login, loginWithGoogle } = useAuth()
```

Add the handler (inside `LoginForm`, after `handleSubmit`):

```ts
const handleGoogleLogin = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    setError(null)
    setIsLoading(true)
    try {
      await loginWithGoogle(tokenResponse.access_token)
      router.push(from)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google login failed")
    } finally {
      setIsLoading(false)
    }
  },
  onError: () => {
    setError("Google sign-in was cancelled or failed")
  },
})
```

Add divider + button inside `<CardContent>`, after the `<form>`:

```tsx
<div className="relative my-4">
  <div className="absolute inset-0 flex items-center">
    <span className="w-full border-t" />
  </div>
  <div className="relative flex justify-center text-xs uppercase">
    <span className="bg-card px-2 text-muted-foreground">or</span>
  </div>
</div>

<Button
  type="button"
  variant="outline"
  className="w-full"
  disabled={isLoading}
  onClick={() => handleGoogleLogin()}
>
  Sign in with Google
</Button>
```

---

## Notes

- The login page uses a `Suspense` wrapper around the inner `LoginForm` component (required by Next.js for `useSearchParams()`). This is already in place and should be kept.
- The `from` redirect variable should be hoisted out of `handleSubmit` so both handlers can share it:
  ```ts
  const from = searchParams.get("from") ?? "/dashboard"
  ```
- The BFF route at `app/api/auth/google/route.ts` expects `{ idToken }` in the request body and returns `{ user, accessToken }`.
