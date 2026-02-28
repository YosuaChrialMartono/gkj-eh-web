import { Skeleton } from "@/components/ui/skeleton"

export default function SermonsLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Skeleton className="h-9 w-28 mb-2" />
        <Skeleton className="h-4 w-52" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6 flex flex-col gap-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  )
}
