import { Suspense } from "react"
import { getContentList } from "@/lib/api/content"
import { ContentStatus } from "@/lib/types"
import type { ContentListItem } from "@/lib/types"
import { DashboardGreeting } from "@/components/dashboard/dashboard-greeting"
import { KpiPlaceholder } from "@/components/dashboard/kpi-placeholder"
import { DraftsCard } from "@/components/dashboard/drafts-card"
import { JadwalCard } from "@/components/dashboard/jadwal-card"
import { Skeleton } from "@/components/ui/skeleton"

function JadwalSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <Skeleton className="mb-4 h-5 w-32" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  let drafts: ContentListItem[] = []
  let draftCount = 0

  try {
    const res = await getContentList({ status: ContentStatus.draft, limit: 5 })
    drafts = res.data
    draftCount = res.total
  } catch {
    // API unavailable — render empty state
  }

  return (
    <div className="px-2 pb-12 md:px-4">
      <DashboardGreeting draftCount={draftCount} jadwalCount={0} />

      <KpiPlaceholder />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-[minmax(0,1fr)_340px]">
        <DraftsCard items={drafts} />
        <Suspense fallback={<JadwalSkeleton />}>
          <JadwalCard />
        </Suspense>
      </div>
    </div>
  )
}
