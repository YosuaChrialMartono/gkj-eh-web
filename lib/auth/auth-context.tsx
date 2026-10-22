"use client"
import { createContext, use, useState, useEffect, useCallback } from "react"
import { signIn } from "next-auth/react"
import { registerAction, logoutAction } from "@/lib/server/auth/actions"
import type { User } from "@/lib/types"

interface AuthContextValue {
  user: User | null
  /** Deprecated: no Nest bearer token exists in a local Auth.js session. */
  accessToken: null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: (redirectTo?: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<boolean>
}
const AuthContext = createContext<AuthContextValue | null>(null)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const refreshAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/current", { cache: "no-store" })
      const current = response.ok ? await response.json() as User : null
      setUser(current)
      return !!current
    } catch { setUser(null); return false }
  }, [])
  useEffect(() => {
    // Session refresh synchronizes with an external HTTP source, not derived render state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshAuth().finally(() => setIsLoading(false))
  }, [refreshAuth])
  async function login(email: string, password: string) {
    const result = await signIn("credentials", { email, password, redirect: false })
    if (result?.error || !await refreshAuth()) throw new Error("Invalid credentials")
  }
  async function register(name: string, email: string, password: string) {
    const result = await registerAction({ name, email, password })
    if (!result.ok) throw new Error(result.error.message)
    await login(email, password)
  }
  async function loginWithGoogle(redirectTo = "/dashboard") { await signIn("google", { redirectTo }) }
  async function logout() { setUser(null); await logoutAction() }
  return <AuthContext value={{ user, accessToken: null, isLoading, login, loginWithGoogle, register, logout, refreshAuth }}>{children}</AuthContext>
}
export function useAuth() {
  const ctx = use(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
