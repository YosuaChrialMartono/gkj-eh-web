"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import type { TocItem } from "@/lib/content-toc"

interface ReaderTocProps {
  items: TocItem[]
  className?: string
}

export function ReaderToc({ items, className }: ReaderTocProps) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null)

  useEffect(() => {
    if (items.length === 0) return

    const headings = items
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => el !== null)
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id)
          return
        }
        const above = entries
          .filter((e) => e.boundingClientRect.top < 0)
          .sort((a, b) => b.boundingClientRect.top - a.boundingClientRect.top)
        if (above[0]?.target.id) setActiveId(above[0].target.id)
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: [0, 1] }
    )
    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <nav className={cn("flex flex-col gap-0.5", className)} aria-label="Daftar isi">
      <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Daftar Isi
      </div>
      {items.map((t) => {
        const active = t.id === activeId
        return (
          <a
            key={t.id}
            href={`#${t.id}`}
            className={cn(
              "border-l-2 py-2 pl-3.5 text-sm leading-snug transition-colors",
              active
                ? "border-foreground font-semibold text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </a>
        )
      })}
    </nav>
  )
}
