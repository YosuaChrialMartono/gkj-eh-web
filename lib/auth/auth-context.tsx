"use client"

import { createContext, use, useState, useEffect, useCallback } from "react"
import type { User } from "@/lib/types"

interface AuthContextValue {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" })
      if (!res.ok) return false
      const data = await res.json() as { user: User; accessToken: string }
      setUser(data.user)
      setAccessToken(data.accessToken)
      return true
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    refreshAuth().finally(() => setIsLoading(false))
  }, [refreshAuth])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Login failed" }))
      throw new Error(err.message ?? "Login failed")
    }
    const data = await res.json() as { user: User; accessToken: string }
    setUser(data.user)
    setAccessToken(data.accessToken)
  }, [])

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

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    setAccessToken(null)
  }, [])

  return (
    <AuthContext value={{ user, accessToken, isLoading, login, register, logout, refreshAuth }}>
      {children}
    </AuthContext>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = use(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
