// KPI strip placeholder. Real numbers deferred —
// see ~/.claude/plans/dashboard-kpis.md
const SLOTS = [
  { label: "Berita bulan ini" },
  { label: "Khotbah dipublikasi" },
  { label: "Draft tertunda" },
] as const

export function KpiPlaceholder() {
  return (
    <div className="mb-9 grid gap-3 sm:grid-cols-3">
      {SLOTS.map((s) => (
        <div
          key={s.label}
          className="rounded-md border border-dashed border-border bg-card px-5 py-4"
        >
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            {s.label}
          </div>
          <div className="font-serif text-2xl font-semibold leading-none tracking-tight text-muted-foreground">
            —
          </div>
          <div className="mt-1.5 text-[11px] text-muted-foreground">
            Segera hadir
          </div>
        </div>
      ))}
    </div>
  )
}
