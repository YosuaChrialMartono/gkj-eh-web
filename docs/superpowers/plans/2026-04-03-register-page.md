# Register Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a registration page and extend AuthContext with a `register()` method so new users can create accounts and be automatically logged in.

**Architecture:** Extend `AuthContextValue` with a `register()` method that calls `POST /api/auth/register`, sets user/token state on success, and throws on failure. The register page mirrors the login page structure — a `RegisterForm` component inside `<Suspense>` — with fields for name, email, password, and confirm password, plus a link back to login.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript (strict), Shadcn UI (Card, Input, Label, Button), `useAuth()` hook from `lib/auth/auth-context.tsx`

---

### Task 1: Extend AuthContext with register()

**Files:**
- Modify: `lib/auth/auth-context.tsx`

- [ ] **Step 1: Add `register` to `AuthContextValue` interface**

In `lib/auth/auth-context.tsx`, update the interface (lines 6–13):

```typescript
interface AuthContextValue {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<boolean>
}
```

- [ ] **Step 2: Implement `register` in `AuthProvider`**

Add the `register` callback after the `login` callback (around line 52), following the same pattern:

```typescript
const register = useCallback(async (name: string, email: string, password: string) => {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Registration failed" }))
    throw new Error(err.message ?? "Registration failed")
  }
  const data = await res.json() as { user: User; accessToken: string }
  setUser(data.user)
  setAccessToken(data.accessToken)
}, [])
```

- [ ] **Step 3: Add `register` to the context value**

Update the `<AuthContext value={...}>` JSX (around line 61):

```typescript
<AuthContext value={{ user, accessToken, isLoading, login, register, logout, refreshAuth }}>
  {children}
</AuthContext>
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `pnpm build 2>&1 | head -30`

Expected: No TypeScript errors related to `auth-context.tsx`. (Build may fail on other things — that's fine at this stage.)

- [ ] **Step 5: Commit**

```bash
git add lib/auth/auth-context.tsx
git commit -m "feat: add register() method to AuthContext"
```

---

### Task 2: Create the register page

**Files:**
- Create: `app/(auth)/register/page.tsx`

- [ ] **Step 1: Create the file**

Create `app/(auth)/register/page.tsx` with the following content:

```typescript
"use client"

import { Suspense, useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function RegisterForm() {
  const { register } = useAuth()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    setIsLoading(true)
    try {
      await register(name, email, password)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>GKJ Eben Haezer</CardTitle>
        <CardDescription>Create your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground underline underline-offset-4 hover:text-primary">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm build 2>&1 | head -30`

Expected: No TypeScript errors. Successful build output.

- [ ] **Step 3: Smoke test manually**

Run `pnpm dev` and navigate to `http://localhost:3000/register`. Verify:
- Form renders with all four fields (Name, Email, Password, Confirm Password)
- Mismatched passwords show "Passwords do not match" without making a network request
- "Sign in" link navigates to `/login`

- [ ] **Step 4: Commit**

```bash
git add app/(auth)/register/page.tsx
git commit -m "feat: add register page"
```
