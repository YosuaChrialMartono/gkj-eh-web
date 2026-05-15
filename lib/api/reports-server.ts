import "server-only"
import { authenticatedApiClient } from "./client"
import { getAccessToken } from "@/lib/auth/server-utils"
import type { ServiceReport } from "@/types"

async function authedGet<T>(path: string): Promise<T> {
  const token = await getAccessToken()
  if (!token) throw { message: "Not authenticated", status: 401 }
  return authenticatedApiClient<T>(token, path)
}

export async function fetchReports(): Promise<ServiceReport[]> {
  return authedGet<ServiceReport[]>("/reports")
}

export async function fetchReport(id: string): Promise<ServiceReport> {
  return authedGet<ServiceReport>(`/reports/${id}`)
}

export async function fetchMembers(): Promise<string[]> {
  return authedGet<string[]>("/members")
}
