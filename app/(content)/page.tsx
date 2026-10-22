import { getPublicContentList } from "@/lib/api/content"
import { ContentType, ContentStatus } from "@/lib/types"
import type { ContentListItem } from "@/lib/types"
import { LandingHero } from "@/components/landing/hero"
import { ServiceTimes } from "@/components/landing/service-times"
import { FeaturedReading } from "@/components/landing/featured-reading"
import { NewsList } from "@/components/landing/news-list"
import { AnnouncementsStrip } from "@/components/landing/announcements-strip"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [articlesRes, announcementsRes] = await Promise.all([
    getPublicContentList({ type: ContentType.article, status: ContentStatus.published, limit: 6 }),
    getPublicContentList({ type: ContentType.announcement, status: ContentStatus.published, limit: 3 }),
  ])
  const recentArticles: ContentListItem[] = articlesRes.data
  const featured: ContentListItem | null = articlesRes.data[0] ?? null
  const announcements: ContentListItem[] = announcementsRes.data

  return (
    <>
      <LandingHero />
      <ServiceTimes />
      <FeaturedReading item={featured} />
      <NewsList items={recentArticles.slice(0, 4)} />
      <AnnouncementsStrip items={announcements} />
    </>
  )
}
