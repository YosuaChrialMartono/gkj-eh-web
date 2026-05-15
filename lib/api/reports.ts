import type {
  ServiceReport,
  CreateServiceReportInput,
  UpdateServiceReportInput,
} from "@/types"

// Client-side helpers. They go through the Next.js BFF (`/api/...`), which
// proxies to the NestJS backend with the user's refresh-token cookie.
// Server components should import from `./reports-server` instead.

const BFF = "/api"

async function bff<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BFF}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? body?.message ?? `Request failed: ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function fetchReports(): Promise<ServiceReport[]> {
  return bff<ServiceReport[]>("/reports")
}

export async function fetchReport(id: string): Promise<ServiceReport> {
  return bff<ServiceReport>(`/reports/${id}`)
}

export async function fetchMembers(): Promise<string[]> {
  return bff<string[]>("/members")
}

export async function createReport(
  data: CreateServiceReportInput,
): Promise<ServiceReport> {
  return bff<ServiceReport>("/reports", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateReport(
  id: string,
  data: UpdateServiceReportInput,
): Promise<ServiceReport> {
  return bff<ServiceReport>(`/reports/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteReport(id: string): Promise<void> {
  return bff<void>(`/reports/${id}`, { method: "DELETE" })
}
