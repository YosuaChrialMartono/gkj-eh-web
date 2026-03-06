# Authentication & API Flow

## Authentication Flow

### 1. Token Storage
- **Access token**: Stored in React state via `AuthContext` (client-side only)
- **Refresh token**: Stored in HTTP-only cookie (`refresh_token`)

### 2. Login Process

```
User submits credentials → /api/auth/login → Backend validates → 
Returns { user, accessToken, refreshToken } → 
  - accessToken stored in React state (AuthContext)
  - refreshToken set as HTTP-only cookie (30 days)
```

### 3. Auto-Refresh on Page Load

In `lib/auth/auth-context.tsx`:
```tsx
useEffect(() => {
  refreshAuth().finally(() => setIsLoading(false))
}, [refreshAuth])

// Calls /api/auth/refresh which:
// 1. Reads refresh_token cookie
// 2. Exchanges it for new accessToken
// 3. Returns { user, accessToken }
```

---

## API Request Flow

### Two Types of Clients

| Client | Use Case | Adds Headers |
|--------|----------|--------------|
| `apiClient` | Public requests (login, register, refresh) | `Content-Type: application/json` |
| `authenticatedApiClient` | Protected requests | `Authorization: Bearer ${token}` |

### Server-Side (lib/api/client.ts)
```ts
export async function apiClient<T>(path: string, options?: RequestOptions): Promise<T> {
  const url = buildUrl(path, params)  // builds full URL from API_URL env
  const res = await fetch(url, {
    ...fetchOptions,
    headers: { "Content-Type": "application/json", ...fetchOptions.headers },
  })
  if (!res.ok) throw await parseError(res)
  return res.json()
}

export async function authenticatedApiClient<T>(token: string, path: string, options?: RequestOptions): Promise<T> {
  return apiClient<T>(path, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options?.headers },
  })
}
```

### Client-Side (components)

Components get `accessToken` from `useAuth()` hook and include it manually in fetch headers:

```tsx
// components/content/content-form.tsx
const { accessToken } = useAuth()

const res = await fetch("/api/content", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,  // ← accessToken from AuthContext
  },
  body: JSON.stringify(payload),
})
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │                    AuthContext                            │  │
│   │  { user, accessToken, login(), logout(), refreshAuth() } │  │
│   └──────────────────────────────────────────────────────────┘  │
│            ▲                   ▲                  ▲              │
│            │                   │                  │              │
│   useAuth()│           login() │          refreshAuth()          │
│            │                   │                  │              │
│   ┌────────┴───┐      ┌────────┴─────┐    ┌───────┴────────┐   │
│   │ Components │      │ /api/auth/   │    │ /api/auth/      │   │
│   │ (content,  │ ──▶  │ login/route  │    │ refresh/route   │   │
│   │  pelayan)  │      └──────────────┘    └────────────────┘   │
│   └────────────┘                                                  │
│         │                                                         │
│         │ fetch(url, { Authorization: Bearer ${accessToken} })  │
│         ▼                                                         │
├─────────────────────────────────────────────────────────────────┤
│                        SERVER SIDE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │                      API Routes                           │  │
│   │  /api/auth/*  ──▶  lib/api/auth.ts  ──▶  External API   │  │
│   │  /api/content/*                                          │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │               Cookies (HTTP-only)                        │  │
│   │  refresh_token: 30-day expiry, httpOnly, secure          │  │
│   └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary

1. **Login** → returns accessToken + sets refresh_token cookie
2. **Every request** → components manually add `Authorization: Bearer ${accessToken}` header
3. **Token expired** → call `refreshAuth()` which hits `/api/auth/refresh` → reads cookie → gets new token
4. **Logout** → clears React state, calls `/api/auth/logout` to invalidate session

Note: The external API URL is set via `API_URL` environment variable (see `lib/api/client.ts:8-9`).
