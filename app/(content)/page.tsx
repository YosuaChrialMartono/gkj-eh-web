import Link from "next/link"
import { getPublicContentList } from "@/lib/api/content"
import { ContentType, ContentStatus } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ContentListItem } from "@/lib/types"

function formatDate(iso: string | null): string {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })
}

function ContentCard({ item }: { item: ContentListItem }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-snug">
            <Link href={`/${item.slug}`} className="hover:underline">
              {item.title}
            </Link>
          </CardTitle>
          <Badge variant="outline" className="shrink-0">{item.type}</Badge>
        </div>
        <CardDescription>
          {item.authorName} · {formatDate(item.publishedAt ?? item.createdAt)}
        </CardDescription>
      </CardHeader>
      {item.featuredImageUrl && (
        <CardContent>
          <img
            src={item.featuredImageUrl}
            alt={item.title}
            className="w-full h-40 object-cover rounded-md"
          />
        </CardContent>
      )}
    </Card>
  )
}

export default async function HomePage() {
  let recentArticles: ContentListItem[] = []
  let latestSermon: ContentListItem | null = null
  let announcements: ContentListItem[] = []

  try {
    const [articlesRes, sermonsRes, announcementsRes] = await Promise.all([
      getPublicContentList({ type: ContentType.article, status: ContentStatus.published, limit: 6 }),
      getPublicContentList({ type: ContentType.sermon, status: ContentStatus.published, limit: 1 }),
      getPublicContentList({ type: ContentType.announcement, status: ContentStatus.published, limit: 3 }),
    ])
    recentArticles = articlesRes.data
    latestSermon = sermonsRes.data[0] ?? null
    announcements = announcementsRes.data
  } catch {
    // API unavailable — render empty state
  }

  return (
    <div className="flex flex-col gap-12">
      {/* Hero */}
      <section className="text-center py-16 bg-muted/30 rounded-2xl px-8">
        <h1 className="text-4xl font-bold tracking-tight">GKJ Eben Haezer</h1>
        <p className="text-muted-foreground mt-4 text-lg max-w-xl mx-auto">
          Gereja Kristen Jawa Eben Haezer — Bersekutu, Bersaksi, Melayani
        </p>
      </section>

      {/* Latest Sermon */}
      {latestSermon && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Khotbah Terbaru</h2>
          <ContentCard item={latestSermon} />
        </section>
      )}

      {/* Recent Articles */}
      {recentArticles.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Berita Terkini</h2>
            <Link href="/news" className="text-sm text-muted-foreground hover:underline">
              Lihat semua →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentArticles.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Pengumuman</h2>
          <div className="flex flex-col gap-3">
            {announcements.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                <div>
                  <Link href={`/${item.slug}`} className="font-medium hover:underline">
                    {item.title}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDate(item.publishedAt ?? item.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
