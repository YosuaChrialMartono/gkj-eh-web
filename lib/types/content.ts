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

// Author projection returned by the backend. Public endpoints only return
// { name, avatar }; authenticated endpoints add { email, role }. Never a password.
export interface ContentAuthor {
  name: string
  avatar: string | null
  email?: string
  role?: string
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
  author: ContentAuthor | null
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
  author: ContentAuthor | null
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
