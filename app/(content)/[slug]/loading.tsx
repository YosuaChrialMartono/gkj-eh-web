import { Skeleton } from "@/components/ui/skeleton"

export default function SlugLoading() {
  return (
    <article className="max-w-3xl mx-auto">
      <header className="mb-8">
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-10 w-3/4 mb-2" />
        <Skeleton className="h-10 w-1/2 mb-4" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
      </header>
      <Skeleton className="w-full h-64 md:h-96 rounded-xl mb-8" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className={`h-4 ${i % 4 === 3 ? "w-2/3" : "w-full"}`} />
        ))}
      </div>
    </article>
  )
}
