import { getPublicContentList } from "@/lib/api/content"
import { ContentType, ContentStatus } from "@/lib/types"
import type { ContentListItem } from "@/lib/types"
import { LandingHero } from "@/components/landing/hero"
import { ServiceTimes } from "@/components/landing/service-times"
import { FeaturedReading } from "@/components/landing/featured-reading"
import { NewsList } from "@/components/landing/news-list"
import { AnnouncementsStrip } from "@/components/landing/announcements-strip"

export default async function HomePage() {
  let recentArticles: ContentListItem[] = []
  let featured: ContentListItem | null = null
  let announcements: ContentListItem[] = []

  try {
    const [articlesRes, announcementsRes] = await Promise.all([
      getPublicContentList({
        type: ContentType.article,
        status: ContentStatus.published,
        limit: 6,
      }),
      getPublicContentList({
        type: ContentType.announcement,
        status: ContentStatus.published,
        limit: 3,
      }),
    ])
    recentArticles = articlesRes.data
    featured = articlesRes.data[0] ?? null
    announcements = announcementsRes.data
  } catch {
    // API unavailable — render empty states
  }

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
