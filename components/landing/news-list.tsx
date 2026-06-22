import Link from "next/link"
import type { ContentListItem } from "@/lib/types"

interface NewsListProps {
  items: ContentListItem[]
}

const TYPE_LABEL: Record<string, string> = {
  article: "Berita",
  sermon: "Khotbah",
  announcement: "Pengumuman",
  page: "Halaman",
}

function formatID(iso: string | null): string {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function NewsList({ items }: NewsListProps) {
  return (
    <section className="mx-auto max-w-[1180px] px-6 pt-24 pb-12 md:px-8 md:pt-28">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="font-serif text-3xl font-semibold tracking-tight md:text-[32px]">
          Berita terkini
        </h2>
        <Link
          href="/news"
          className="text-sm font-semibold text-accent hover:underline"
        >
          Lihat semua →
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-md border border-dashed border-border p-10 text-center text-muted-foreground">
          Belum ada berita.
        </div>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {items.map((n) => (
            <li key={n.id}>
              <Link
                href={`/${n.slug}`}
                className="grid items-baseline gap-3 py-7 transition-colors hover:[&_h3]:text-accent md:grid-cols-[120px_1fr_220px] md:gap-8"
              >
                <div className="font-serif text-base italic text-muted-foreground tabular-nums md:text-lg">
                  {formatID(n.publishedAt ?? n.createdAt)}
                </div>
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                    {TYPE_LABEL[n.type] ?? n.type}
                  </div>
                  <h3 className="text-balance font-serif text-xl font-semibold leading-[1.2] tracking-tight transition-colors md:text-[22px]">
                    {n.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {n.author?.name}
                  </p>
                </div>
                <div className="text-sm font-semibold text-accent md:text-right">
                  Baca →
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
