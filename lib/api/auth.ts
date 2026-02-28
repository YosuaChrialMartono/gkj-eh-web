import { apiClient, authenticatedApiClient } from "./client"
import type { AuthResponse, LoginInput, RegisterInput, GoogleAuthInput } from "@/lib/types"

export async function login(input: LoginInput): Promise<AuthResponse> {
  return apiClient("/auth/login", { method: "POST", body: JSON.stringify(input) })
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  return apiClient("/auth/register", { method: "POST", body: JSON.stringify(input) })
}

export async function googleAuth(input: GoogleAuthInput): Promise<AuthResponse> {
  return apiClient("/auth/google", { method: "POST", body: JSON.stringify(input) })
}

export async function refreshToken(token: string): Promise<AuthResponse> {
  return apiClient("/auth/refresh", { method: "POST", body: JSON.stringify({ refreshToken: token }) })
}

export async function logout(accessToken: string): Promise<void> {
  return authenticatedApiClient(accessToken, "/auth/logout", { method: "POST" })
}
