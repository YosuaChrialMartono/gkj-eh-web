import Image from "next/image"
import Link from "next/link"
import type { Content } from "@/lib/types"
import type { TocItem } from "@/lib/content-toc"
import { ReaderToc } from "./reader-toc"
import { ReaderControlsRail, ReaderControlsFab } from "./reader-controls"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface ArticleReaderProps {
  content: Content
  html: string
  toc: TocItem[]
  readingTimeMin: number
}

const TYPE_LABEL: Record<string, string> = {
  article: "Berita Jemaat",
  sermon: "Khotbah",
  announcement: "Pengumuman",
  page: "Halaman",
}

const TYPE_INDEX: Record<string, { href: string; label: string } | undefined> = {
  article: { href: "/news", label: "Berita" },
  sermon: { href: "/sermons", label: "Khotbah" },
}

function formatID(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function authorInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("")
    .padEnd(2, "·")
    .slice(0, 2)
}

export function ArticleReader({ content, html, toc, readingTimeMin }: ArticleReaderProps) {
  const eyebrow = TYPE_LABEL[content.type] ?? content.type
  const dateIso = content.publishedAt ?? content.createdAt
  const index = TYPE_INDEX[content.type]

  return (
    <div className="min-h-screen bg-background font-serif text-foreground">
      <div className="mx-auto max-w-[760px] px-6 pt-8 font-sans md:px-8 md:pt-10">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {index ? (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={index.href}>{index.label}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1">{content.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="mx-auto max-w-[760px] px-6 pt-6 md:pt-8 md:px-8">
        <div className="mb-7 flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <span>{eyebrow}</span>
          <span aria-hidden className="h-1 w-1 rounded-full bg-current opacity-60" />
          <time dateTime={dateIso}>{formatID(dateIso)}</time>
          <span aria-hidden className="h-1 w-1 rounded-full bg-current opacity-60" />
          <span>{readingTimeMin} menit baca</span>
        </div>

        <h1 className="mb-7 text-balance text-center font-serif text-4xl font-semibold leading-[1.08] tracking-[-0.018em] text-foreground md:text-[52px]">
          {content.title}
        </h1>

        {content.status !== "published" && (
          <div className="mb-6 text-center text-xs uppercase tracking-widest text-accent">
            {content.status}
          </div>
        )}

        <div className="mb-12 flex items-center justify-center gap-3 font-sans text-sm text-muted-foreground md:mb-14">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary font-semibold text-secondary-foreground">
            {authorInitials(content.authorName)}
          </span>
          <span className="font-medium text-foreground">{content.authorName}</span>
        </div>
      </div>

      {content.featuredImageUrl ? (
        <figure className="mx-auto mb-16 max-w-[1080px] px-6 md:px-8">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm bg-secondary md:aspect-[24/10]">
            <Image
              src={content.featuredImageUrl}
              alt={content.title}
              fill
              priority
              sizes="(min-width: 1024px) 1080px, 100vw"
              className="object-cover"
            />
          </div>
        </figure>
      ) : (
        <div className="mx-auto mb-16 max-w-[1080px] px-6 md:px-8">
          <div
            className="h-64 w-full rounded-sm md:h-[420px]"
            style={{
              background:
                "repeating-linear-gradient(135deg, var(--secondary) 0 14px, var(--muted) 14px 28px)",
            }}
            aria-hidden
          />
        </div>
      )}

      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-6 pb-32 md:px-8 md:pb-40 lg:grid-cols-[200px_minmax(0,1fr)_200px] lg:gap-14">
        <ReaderToc items={toc} className="hidden lg:flex lg:sticky lg:top-24 lg:self-start lg:pt-2" />

        <article
          className="prose-editorial mx-auto"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <ReaderControlsRail className="hidden lg:block lg:pt-2" />
      </div>

      <ReaderControlsFab />
    </div>
  )
}
