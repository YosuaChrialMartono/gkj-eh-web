"use client"

import { useEffect, useState } from "react"
import { Type } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const FONT_SIZES = [17, 19, 21, 23] as const
const LINE_HEIGHTS = [
  { v: 1.55, label: "Rapat" },
  { v: 1.75, label: "Sedang" },
  { v: 1.95, label: "Lega" },
] as const

const STORAGE_KEY = "reader-prefs:v1"

interface Prefs {
  fontSize: number
  lineHeight: number
}

const DEFAULTS: Prefs = { fontSize: 19, lineHeight: 1.75 }

function applyToRoot(prefs: Prefs) {
  const root = document.documentElement
  root.style.setProperty("--reader-fs", `${prefs.fontSize}px`)
  root.style.setProperty("--reader-lh", String(prefs.lineHeight))
}

function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    const parsed = JSON.parse(raw) as Partial<Prefs>
    return {
      fontSize: typeof parsed.fontSize === "number" ? parsed.fontSize : DEFAULTS.fontSize,
      lineHeight: typeof parsed.lineHeight === "number" ? parsed.lineHeight : DEFAULTS.lineHeight,
    }
  } catch {
    return DEFAULTS
  }
}

function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS)

  useEffect(() => {
    // Post-hydration only: localStorage is browser-only.
    const loaded = loadPrefs()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefs(loaded)
    applyToRoot(loaded)
  }, [])

  const update = (patch: Partial<Prefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch }
      applyToRoot(next)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  return { prefs, update }
}

function ControlsBody({
  prefs,
  onChange,
}: {
  prefs: Prefs
  onChange: (patch: Partial<Prefs>) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2.5 text-xs text-muted-foreground">Ukuran teks</div>
        <div className="flex gap-1.5">
          {FONT_SIZES.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange({ fontSize: s })}
              className={cn(
                "flex-1 rounded-sm border py-2 font-serif transition-colors",
                prefs.fontSize === s
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
              style={{ fontSize: 12 + i * 2 }}
              aria-pressed={prefs.fontSize === s}
              aria-label={`Ukuran ${s}px`}
            >
              A
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2.5 text-xs text-muted-foreground">Spasi baris</div>
        <div className="flex gap-1.5">
          {LINE_HEIGHTS.map((s) => (
            <button
              key={s.v}
              type="button"
              onClick={() => onChange({ lineHeight: s.v })}
              className={cn(
                "flex-1 rounded-sm border py-2 text-[11px] transition-colors",
                prefs.lineHeight === s.v
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={prefs.lineHeight === s.v}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ReaderControlsRail({ className }: { className?: string }) {
  const { prefs, update } = usePrefs()
  return (
    <aside className={cn("sticky top-24 self-start", className)}>
      <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Tampilan
      </div>
      <ControlsBody prefs={prefs} onChange={update} />
      <div className="mt-8 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
        Bagikan artikel ini agar lebih banyak jemaat dapat membaca.
      </div>
    </aside>
  )
}

export function ReaderControlsFab({ className }: { className?: string }) {
  const { prefs, update } = usePrefs()
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Pengaturan baca"
          className={cn(
            "fixed right-5 bottom-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform hover:scale-105 md:hidden",
            className
          )}
        >
          <Type className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl px-6 pb-8 pt-4">
        <SheetHeader className="px-0 pb-2">
          <SheetTitle className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Tampilan
          </SheetTitle>
        </SheetHeader>
        <ControlsBody prefs={prefs} onChange={update} />
      </SheetContent>
    </Sheet>
  )
}
