import type { PelayanService } from "@/lib/types"

/** Returns "YYYY-MM-DD" strings for all Sundays in the given month ("YYYY-MM") */
export function getSundaysForMonth(month: string): string[] {
  const [year, mon] = month.split("-").map(Number)
  const sundays: string[] = []
  const date = new Date(year, mon - 1, 1)
  // Advance to first Sunday
  while (date.getDay() !== 0) {
    date.setDate(date.getDate() + 1)
  }
  while (date.getMonth() === mon - 1) {
    const mm = String(date.getMonth() + 1).padStart(2, "0")
    const dd = String(date.getDate()).padStart(2, "0")
    sundays.push(`${date.getFullYear()}-${mm}-${dd}`)
    date.setDate(date.getDate() + 7)
  }
  return sundays
}

export type VirtualServiceRow = { date: string; virtual: true }
export type ServiceRow = PelayanService | VirtualServiceRow

export function isVirtualRow(row: ServiceRow): row is VirtualServiceRow {
  return (row as VirtualServiceRow).virtual === true
}

/**
 * Merges backend services with computed Sundays.
 * - Sundays that exist in `services` use the real service record.
 * - Sundays not in `services` appear as virtual rows (no id).
 * - Extra service dates (isExtra) are appended at the end.
 * - Result is sorted ascending by date.
 */
export function mergeServicesWithSundays(services: PelayanService[], month: string): ServiceRow[] {
  const sundays = getSundaysForMonth(month)
  const serviceByDate = new Map(services.map((s) => [s.date, s]))

  const rows: ServiceRow[] = sundays.map((date) => {
    const real = serviceByDate.get(date)
    return real ?? { date, virtual: true }
  })

  // Add extra services not already in sunday list
  for (const svc of services) {
    if (svc.isExtra && !sundays.includes(svc.date)) {
      rows.push(svc)
    }
  }

  rows.sort((a, b) => a.date.localeCompare(b.date))
  return rows
}
