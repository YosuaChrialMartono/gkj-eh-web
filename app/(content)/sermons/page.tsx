import Link from "next/link"
import { getPublicContentList } from "@/lib/api/content"
import { ContentType, ContentStatus } from "@/lib/types"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ContentListItem } from "@/lib/types"

interface SermonsPageProps {
  searchParams: Promise<{ page?: string }>
}

function formatDate(iso: string | null): string {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })
}

export const metadata = {
  title: "Khotbah — GKJ Eben Haezer",
  description: "Khotbah-khotbah dari GKJ Eben Haezer",
}

export default async function SermonsPage({ searchParams }: SermonsPageProps) {
  const sp = await searchParams
  const page = sp.page ? Number(sp.page) : 1
  const limit = 12

  let sermons: ContentListItem[] = []
  let totalPages = 1

  try {
    const result = await getPublicContentList({
      type: ContentType.sermon,
      status: ContentStatus.published,
      page,
      limit,
    })
    sermons = result.data
    totalPages = result.totalPages
  } catch {
    // API unavailable
  }

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-8 px-6 py-12 md:px-8">
      <div>
        <h1 className="font-serif text-4xl font-semibold tracking-tight">Khotbah</h1>
        <p className="mt-2 text-muted-foreground">Kumpulan khotbah GKJ Eben Haezer</p>
      </div>

      {sermons.length === 0 ? (
        <p className="text-muted-foreground">Belum ada khotbah.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sermons.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">
                  <Link href={`/${item.slug}`} className="hover:underline">
                    {item.title}
                  </Link>
                </CardTitle>
                <CardDescription>
                  {item.authorName} · {formatDate(item.publishedAt ?? item.createdAt)}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Button variant="outline" asChild>
              <Link href={`/sermons?page=${page - 1}`}>Previous</Link>
            </Button>
          )}
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Button variant="outline" asChild>
              <Link href={`/sermons?page=${page + 1}`}>Next</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
