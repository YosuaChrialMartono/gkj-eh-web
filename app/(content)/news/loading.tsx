import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader } from "@/components/ui/card"

export default function NewsLoading() {
  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-8 px-6 py-12 md:px-8">
      <div>
        <h1 className="font-serif text-4xl font-semibold tracking-tight">Berita</h1>
        <p className="mt-2 text-muted-foreground">Berita dan artikel terbaru</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-14 w-full" />
              <Skeleton className="mt-3 h-4 w-2/3" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
