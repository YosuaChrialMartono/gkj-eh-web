import "server-only"
import { listReports, getReport } from "@/lib/server/reports/queries"
import { listMemberNames } from "@/lib/server/members"
import type { ServiceReport } from "@/types"

export async function fetchReports(): Promise<ServiceReport[]> {
  return listReports() as unknown as Promise<ServiceReport[]>
}

export async function fetchReport(id: string): Promise<ServiceReport> {
  return getReport(id) as unknown as Promise<ServiceReport>
}

export async function fetchMembers(): Promise<string[]> {
  return listMemberNames()
}
