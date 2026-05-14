import Link from "next/link"
import { getServices, getAssignments } from "@/lib/api/pelayan"
import type { PelayanService } from "@/lib/types"

const DAY_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

function thisWeekRange(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 7)
  return { start, end }
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

interface ServiceWithAssignees {
  service: PelayanService
  date: Date
  assignees: string[]
}

async function loadWeek(): Promise<ServiceWithAssignees[]> {
  const { start, end } = thisWeekRange()
  const months = new Set<string>([monthKey(start), monthKey(end)])

  let services: PelayanService[] = []
  try {
    const lists = await Promise.all(
      Array.from(months).map((m) => getServices(m).catch(() => [] as PelayanService[]))
    )
    services = lists.flat()
  } catch {
    return []
  }

  const inWeek = services
    .map((s) => ({ s, date: new Date(`${s.date}T00:00:00`) }))
    .filter(({ date }) => date >= start && date < end)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 4)

  const enriched = await Promise.all(
    inWeek.map(async ({ s, date }) => {
      const assigns = await getAssignments(s.id).catch(() => [])
      return {
        service: s,
        date,
        assignees: assigns.map((a) => a.pelayanName).filter(Boolean),
      }
    })
  )
  return enriched
}

export async function JadwalCard() {
  const items = await loadWeek()

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="font-serif text-base font-semibold tracking-tight">
            Jadwal pelayan
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Minggu ini
          </p>
        </div>
        <Link
          href="/pelayan"
          className="text-[11px] font-semibold text-accent hover:underline"
        >
          Lihat semua
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          Belum ada jadwal minggu ini.
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map(({ service, date, assignees }, i) => (
            <li
              key={service.id}
              className={
                i < items.length - 1
                  ? "border-b border-border pb-4"
                  : undefined
              }
            >
              <div className="flex gap-3">
                <div className="flex w-11 shrink-0 flex-col items-center rounded-md border border-border py-1 text-center">
                  <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    {DAY_SHORT[date.getDay()]}
                  </div>
                  <div className="font-serif text-lg font-semibold leading-none">
                    {date.getDate()}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {service.label || (service.isExtra ? "Ibadah Khusus" : "Ibadah")}
                    </span>
                    {service.isExtra && (
                      <span className="text-[10px] uppercase tracking-wider text-accent">
                        Ekstra
                      </span>
                    )}
                  </div>
                  {assignees.length > 0 && (
                    <div className="mt-1 truncate text-[11px] leading-relaxed text-muted-foreground">
                      {assignees.slice(0, 4).join(" · ")}
                      {assignees.length > 4 && ` · +${assignees.length - 4}`}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
