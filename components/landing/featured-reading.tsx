import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { ContentListItem } from "@/lib/types"

interface FeaturedReadingProps {
  item: ContentListItem | null
}

function formatID(iso: string | null): string {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function FeaturedReading({ item }: FeaturedReadingProps) {
  return (
    <section className="mx-auto max-w-[1180px] px-6 pt-24 md:px-8 md:pt-28">
      {item ? (
        <div className="grid gap-10 md:grid-cols-[200px_1fr] md:gap-14">
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Bacaan pekan ini
            </div>
            <div className="text-sm leading-relaxed text-muted-foreground">
              {formatID(item.publishedAt ?? item.createdAt)}
              <br />
              {item.author?.name}
            </div>
          </div>
          <div>
            <h2 className="mb-7 text-balance font-serif text-3xl font-medium italic leading-[1.18] tracking-tight md:text-[38px]">
              <Link href={`/${item.slug}`} className="hover:text-accent transition-colors">
                {item.title}
              </Link>
            </h2>
            <Button asChild variant="outline">
              <Link href={`/${item.slug}`}>Baca selengkapnya →</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-border p-10 text-center">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Bacaan pekan ini
          </div>
          <p className="text-muted-foreground">Belum ada bacaan terbaru.</p>
        </div>
      )}
    </section>
  )
}
