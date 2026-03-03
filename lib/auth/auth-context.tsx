"use client"

import { createContext, useContext, type ReactNode } from "react"

interface AuthUser {
  id: string
  name: string
  email: string
  avatar?: string | null
}

interface AuthContextType {
  accessToken: string | null
  user: AuthUser | null
  refreshAuth: () => Promise<boolean>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={{
    accessToken: null,
    user: null,
    refreshAuth: async () => false,
    login: async () => {},
    logout: async () => {},
    isAuthenticated: false,
  }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
