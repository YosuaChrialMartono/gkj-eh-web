import Link from "next/link"
import type { ContentListItem } from "@/lib/types"

interface AnnouncementsStripProps {
  items: ContentListItem[]
}

function formatID(iso: string | null): string {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function AnnouncementsStrip({ items }: AnnouncementsStripProps) {
  if (items.length === 0) return null

  return (
    <section className="border-t border-border bg-card">
      <div className="mx-auto max-w-[1180px] px-6 py-10 md:px-8">
        <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Pengumuman
        </div>
        <ul className="divide-y divide-border">
          {items.map((a) => (
            <li key={a.id}>
              <Link
                href={`/${a.slug}`}
                className="flex items-baseline justify-between gap-4 py-3 text-sm transition-colors hover:text-accent"
              >
                <span className="truncate font-medium text-foreground hover:text-accent">
                  {a.title}
                </span>
                <time
                  dateTime={a.publishedAt ?? a.createdAt}
                  className="shrink-0 text-xs text-muted-foreground tabular-nums"
                >
                  {formatID(a.publishedAt ?? a.createdAt)}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
