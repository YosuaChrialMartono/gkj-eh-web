import { Suspense } from "react"
import Link from "next/link"
import { cookies } from "next/headers"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MonthPicker } from "@/components/pelayan/month-picker"
import { PelayanTable } from "@/components/pelayan/pelayan-table"
import { AddServiceDialog } from "@/components/pelayan/add-service-dialog"
import { getRoles, getServices, getPersons, getAssignments } from "@/lib/api/pelayan"

interface PelayanPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function PelayanTableSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}

async function PelayanTableLoader({ month, token }: { month: string; token: string }) {
  const [roles, services, persons] = await Promise.all([
    getRoles(token).catch(() => []),
    getServices(token, month).catch(() => []),
    getPersons(token).catch(() => []),
  ])

  // Fetch assignments for all materialised services in parallel
  const assignmentsByService: Record<string, import("@/lib/types").PelayanAssignment[]> = {}
  if (services.length > 0) {
    const results = await Promise.all(
      services.map(async (svc) => {
        const assignments = await getAssignments(token, svc.id).catch(() => [])
        return { id: svc.id, assignments }
      })
    )
    for (const r of results) {
      assignmentsByService[r.id] = r.assignments
    }
  }

  return (
    <PelayanTable
      roles={roles}
      services={services}
      month={month}
      persons={persons}
      assignmentsByService={assignmentsByService}
    />
  )
}

export default async function PelayanPage({ searchParams }: PelayanPageProps) {
  const sp = await searchParams
  const month = (sp.month as string) ?? new Date().toISOString().slice(0, 7)
  const token = ((await cookies()).get("refresh_token")?.value) ?? ""

  const services = await getServices(token, month).catch(() => [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Jadwal Pelayan</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/pelayan/roles">
            <Settings className="mr-1 size-4" />
            Kelola Peran
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <MonthPicker month={month} />
        <AddServiceDialog existingDates={services.map((s) => s.date)} />
      </div>

      <Suspense fallback={<PelayanTableSkeleton />}>
        <PelayanTableLoader month={month} token={token} />
      </Suspense>
    </div>
  )
}
