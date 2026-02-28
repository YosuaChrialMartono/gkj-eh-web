import { notFound } from "next/navigation"
import { getContentBySlug } from "@/lib/api/content"
import { Badge } from "@/components/ui/badge"
import type { Metadata } from "next"

interface SlugPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const content = await getContentBySlug(slug)
    return {
      title: `${content.title} — GKJ Eben Haezer`,
      description: content.body.slice(0, 160).replace(/\n/g, " "),
      openGraph: {
        title: content.title,
        description: content.body.slice(0, 160).replace(/\n/g, " "),
        ...(content.featuredImageUrl ? { images: [content.featuredImageUrl] } : {}),
      },
    }
  } catch {
    return { title: "GKJ Eben Haezer" }
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params

  let content
  try {
    content = await getContentBySlug(slug)
  } catch {
    notFound()
  }

  return (
    <article className="max-w-3xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline">{content.type}</Badge>
          {content.status !== "published" && (
            <Badge variant="secondary">{content.status}</Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold leading-tight mb-4">{content.title}</h1>
        <div className="text-sm text-muted-foreground flex flex-wrap gap-2">
          <span>{content.authorName}</span>
          <span>·</span>
          <time dateTime={content.publishedAt ?? content.createdAt}>
            {formatDate(content.publishedAt ?? content.createdAt)}
          </time>
        </div>
      </header>

      {content.featuredImageUrl && (
        <img
          src={content.featuredImageUrl}
          alt={content.title}
          className="w-full h-64 md:h-96 object-cover rounded-xl mb-8"
        />
      )}

      <div className="prose prose-zinc dark:prose-invert max-w-none whitespace-pre-wrap">
        {content.body}
      </div>
    </article>
  )
}
