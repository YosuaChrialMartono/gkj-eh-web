import Link from "next/link"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { ContentTable } from "@/components/content/content-table"
import { ContentFilters } from "@/components/content/content-filters"
import type { ContentListParams, ContentType, ContentStatus } from "@/lib/types"

interface ContentPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ContentPage({ searchParams }: ContentPageProps) {
  const sp = await searchParams
  const params: ContentListParams = {
    page: sp.page ? Number(sp.page) : 1,
    limit: 20,
    type: sp.type as ContentType | undefined,
    status: sp.status as ContentStatus | undefined,
    search: sp.search as string | undefined,
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Content</h1>
        <Button asChild>
          <Link href="/content/new">New Content</Link>
        </Button>
      </div>
      <ContentFilters />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <ContentTable params={params} />
      </Suspense>
    </div>
  )
}
