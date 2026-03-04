export enum ContentType {
  article = "article",
  page = "page",
  sermon = "sermon",
  announcement = "announcement",
}

export enum ContentStatus {
  draft = "draft",
  published = "published",
  archived = "archived",
}

export interface Content {
  id: string
  title: string
  slug: string
  type: ContentType
  status: ContentStatus
  body: string
  bodyHtml: string | null
  authorId: string
  authorName: string
  featuredImageUrl: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ContentListItem {
  id: string
  title: string
  slug: string
  type: ContentType
  status: ContentStatus
  authorId: string
  authorName: string
  featuredImageUrl: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ContentCreateInput {
  title: string
  slug: string
  type: ContentType
  status: ContentStatus
  body: string
  bodyHtml?: string
  featuredImageUrl?: string
  publishedAt?: string
}

export type ContentUpdateInput = Partial<ContentCreateInput>

export interface ContentListParams {
  page?: number
  limit?: number
  type?: ContentType
  status?: ContentStatus
  search?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
