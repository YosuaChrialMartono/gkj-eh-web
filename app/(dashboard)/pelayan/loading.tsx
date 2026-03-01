import { Skeleton } from "@/components/ui/skeleton"

export default function PelayanLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="rounded-md border">
        <div className="flex flex-col gap-0">
          <Skeleton className="h-10 w-full rounded-none rounded-t-md" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-none border-t" />
          ))}
        </div>
      </div>
    </div>
  )
}
