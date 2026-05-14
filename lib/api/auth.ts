import { authenticatedApiClient, apiClient } from "./client"
import type { User } from "@/lib/types"

interface AuthResponse {
  user: User
  accessToken: string
  refreshToken?: string
}

export async function login(input: { email: string; password: string }): Promise<AuthResponse> {
  return apiClient("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function register(input: { name: string; email: string; password: string }): Promise<AuthResponse> {
  return apiClient("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function refreshToken(token: string): Promise<AuthResponse> {
  // Backend (`/auth/refresh`) is guarded by JwtAuthGuard — expects the JWT in
  // Authorization: Bearer, not in the body.
  return authenticatedApiClient(token, "/auth/refresh", {
    method: "POST",
  })
}

export async function logout(token: string): Promise<void> {
  return apiClient("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ token }),
  })
}

export async function googleAuth(input: { credential: string }): Promise<AuthResponse> {
  return apiClient("/auth/google", {
    method: "POST",
    body: JSON.stringify(input),
  })
}
