import { notFound } from "next/navigation"
import { getContentBySlug } from "@/lib/api/content"
import { ArticleReader } from "@/components/reader/article-reader"
import { injectHeadingIds } from "@/lib/content-toc"
import { readingTime } from "@/lib/reading-time"
import type { Metadata } from "next"

interface SlugPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const content = await getContentBySlug(slug)
    const description = content.bodyHtml
      ? content.bodyHtml.replace(/<[^>]*>/g, "").slice(0, 160)
      : content.body.slice(0, 160).replace(/\n/g, " ")
    return {
      title: `${content.title} — GKJ Eben Haezer`,
      description,
      openGraph: {
        title: content.title,
        description,
        ...(content.featuredImageUrl ? { images: [content.featuredImageUrl] } : {}),
      },
    }
  } catch {
    return { title: "GKJ Eben Haezer" }
  }
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params

  let content
  try {
    content = await getContentBySlug(slug)
  } catch {
    notFound()
  }

  const rawHtml = content.bodyHtml ?? content.body
  const { html, toc } = injectHeadingIds(rawHtml)
  const readingTimeMin = readingTime(rawHtml)

  return (
    <ArticleReader
      content={content}
      html={html}
      toc={toc}
      readingTimeMin={readingTimeMin}
    />
  )
}
