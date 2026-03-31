/**
 * API client — calls the local Next.js API routes (which proxy to the real
 * external API when NEXT_PUBLIC_API_BASE_URL is set, or use the mock store).
 */

import type { ServiceReport, CreateServiceReportInput, UpdateServiceReportInput } from "@/types";

const BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function fetchReports(): Promise<ServiceReport[]> {
  return request<ServiceReport[]>("/reports");
}

export async function fetchReport(id: string): Promise<ServiceReport> {
  return request<ServiceReport>(`/reports/${id}`);
}

export async function createReport(data: CreateServiceReportInput): Promise<ServiceReport> {
  return request<ServiceReport>("/reports", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateReport(
  id: string,
  data: UpdateServiceReportInput,
): Promise<ServiceReport> {
  return request<ServiceReport>(`/reports/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteReport(id: string): Promise<void> {
  return request<void>(`/reports/${id}`, { method: "DELETE" });
}

export async function fetchMembers(): Promise<string[]> {
  return request<string[]>("/members");
}
