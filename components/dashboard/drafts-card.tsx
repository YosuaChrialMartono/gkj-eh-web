import Link from "next/link"
import { ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ContentListItem } from "@/lib/types"

interface DraftsCardProps {
  items: ContentListItem[]
}

const TYPE_LABEL: Record<string, string> = {
  article: "Berita",
  sermon: "Khotbah",
  announcement: "Pengumuman",
  page: "Halaman",
}

function relative(iso: string): string {
  const d = new Date(iso)
  const diffMs = Date.now() - d.getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return "baru saja"
  if (minutes < 60) return `${minutes} mnt lalu`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.round(hours / 24)
  if (days === 1) return "kemarin"
  if (days < 7) return `${days} hari lalu`
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
}

export function DraftsCard({ items }: DraftsCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h2 className="font-serif text-lg font-semibold leading-tight tracking-tight">
            Draft konten
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Yang menunggu review atau publikasi
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/content/new">
            <Plus className="size-4" /> Konten baru
          </Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-muted-foreground">
          Tidak ada draft.
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((r) => (
            <li key={r.id}>
              <Link
                href={`/content/${r.id}/edit`}
                className="grid items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/40 sm:grid-cols-[90px_1fr_auto_24px]"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  {TYPE_LABEL[r.type] ?? r.type}
                </span>
                <span className="truncate text-sm font-medium text-foreground">
                  {r.title}
                </span>
                <Badge variant="outline" className="hidden text-[10px] uppercase tracking-wider sm:inline-flex">
                  {relative(r.updatedAt)}
                </Badge>
                <ChevronRight className="hidden size-4 text-muted-foreground sm:block" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
