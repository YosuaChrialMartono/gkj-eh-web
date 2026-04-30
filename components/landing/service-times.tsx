// Empty-state band. Real service-times data deferred —
// see ~/.claude/plans/service-times-config.md
export function ServiceTimes() {
  return (
    <section
      id="jadwal"
      className="border-y border-border bg-card"
    >
      <div className="mx-auto max-w-[1180px] px-6 py-12 md:px-8 md:py-14">
        <div className="mb-6 flex flex-col items-baseline justify-between gap-2 sm:flex-row">
          <h2 className="font-serif text-2xl font-semibold tracking-tight md:text-[28px]">
            Jadwal ibadah
          </h2>
          <span className="text-sm text-muted-foreground">
            Jl. Eben Haezer 12, Jakarta Pusat
          </span>
        </div>

        <div className="rounded-md border border-dashed border-border bg-background p-10 text-center">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Segera hadir
          </div>
          <p className="mx-auto max-w-md text-pretty text-base text-muted-foreground">
            Jadwal ibadah akan segera diumumkan di sini. Untuk sementara,
            silakan hubungi sekretariat gereja.
          </p>
        </div>
      </div>
    </section>
  )
}
