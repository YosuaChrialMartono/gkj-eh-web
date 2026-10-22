import "server-only"
import { revalidatePath } from "next/cache"
import { and, desc, eq, ilike, or, sql } from "drizzle-orm"
import { z } from "zod"
import { AppError } from "@/lib/actions/result"
import { requireCapability, requireUser } from "@/lib/server/auth"
import { getDb } from "@/lib/server/db"
import { content, users } from "@/lib/server/db/schema"
import { sanitizeContentHtml } from "@/lib/server/content/sanitize"
import { ContentStatus, ContentType } from "@/lib/types/content"
import type { Content } from "@/lib/types/content"

const slugSchema = z.string().trim().max(160).refine(value => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), "Slug must contain lowercase letters, numbers, and hyphens")
const imageUrlSchema = z.string().max(2048).refine(value => {
  if (!value) return true
  if (/^\/api\/media\/[0-9a-f-]+\.(?:jpg|png|webp|gif)$/.test(value)) return true
  try { const parsed = new URL(value); return parsed.protocol === "https:" || parsed.protocol === "http:" } catch { return false }
}, "Image must use HTTP(S) or a local media URL")
const contentInput = z.object({
  title: z.string().trim().min(1).max(300), slug: slugSchema,
  type: z.nativeEnum(ContentType), status: z.nativeEnum(ContentStatus),
  body: z.string().max(1_000_000), bodyHtml: z.string().max(1_000_000).optional(),
  featuredImageUrl: imageUrlSchema.optional(), publishedAt: z.string().datetime().optional(),
}).strict()
const uuidSchema = z.uuid()
const paginationSchema = z.object({
  page: z.number().finite().int().min(1).default(1),
  limit: z.number().finite().int().min(1).max(100).default(10),
})

export function parseContentListParams<T extends { page?: number; limit?: number }>(params: T) {
  return { ...params, ...paginationSchema.parse(params) }
}

function validateContentId(id: string) { return uuidSchema.parse(id) }

function projection(row: typeof content.$inferSelect, authorName: string) {
  return { ...row, bodyHtml: sanitizeContentHtml(row.bodyHtml), publishedAt: row.publishedAt?.toISOString() ?? null, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(), authorName } as unknown as Content
}

function parseBody(body: string) {
  try {
    const value: unknown = JSON.parse(body)
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error()
  } catch { throw new AppError("VALIDATION", "Body must be valid TipTap JSON") }
  return body
}

function slugFromTitle(title: string) {
  return title.normalize("NFKD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 160).replace(/-+$/, "")
}

async function withAuthor(row: typeof content.$inferSelect) {
  const [author] = await getDb().select({ name: users.name }).from(users).where(eq(users.id, row.authorId)).limit(1)
  return projection(row, author?.name ?? "Unknown")
}

async function withPublicAuthor(row: typeof content.$inferSelect) {
  const safeContent = await withAuthor(row)
  Reflect.deleteProperty(safeContent, "authorId")
  return safeContent as unknown as Content
}

function mapDatabaseError(error: unknown): never {
  const visited = new Set<unknown>()
  let current: unknown = error
  while (current && typeof current === "object" && !visited.has(current)) {
    visited.add(current)
    if ("code" in current && current.code === "23505") throw new AppError("CONFLICT", "A content item with this slug already exists")
    current = "cause" in current ? current.cause : undefined
  }
  throw error
}

export async function listPublicContent(params: { page?: number; limit?: number; type?: ContentType; search?: string } = {}) {
  const { page, limit } = parseContentListParams(params)
  const conditions = [eq(content.status, ContentStatus.published), sql`${content.publishedAt} <= now()`]
  if (params.type) conditions.push(eq(content.type, params.type))
  if (params.search?.trim()) conditions.push(or(ilike(content.title, `%${params.search.trim()}%`), ilike(content.bodyHtml, `%${params.search.trim()}%`))!)
  const db = getDb(), where = and(...conditions)
  const [rows, [{ total }]] = await Promise.all([
    db.select().from(content).where(where).orderBy(desc(content.publishedAt), desc(content.createdAt), desc(content.id)).limit(limit).offset((page - 1) * limit),
    db.select({ total: sql<number>`count(*)::int` }).from(content).where(where),
  ])
  const data = await Promise.all(rows.map(withPublicAuthor))
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getPublishedContentBySlug(slug: string) {
  const [row] = await getDb().select().from(content).where(and(eq(content.slug, slug), eq(content.status, ContentStatus.published), sql`${content.publishedAt} <= now()`)).limit(1)
  return row ? withPublicAuthor(row) : null
}

export async function listDashboardContent(params: { page?: number; limit?: number; type?: ContentType; status?: ContentStatus; search?: string } = {}) {
  await requireUser()
  const { page, limit } = parseContentListParams(params)
  const conditions = []
  if (params.type) conditions.push(eq(content.type, params.type))
  if (params.status) conditions.push(eq(content.status, params.status))
  if (params.search?.trim()) conditions.push(or(ilike(content.title, `%${params.search.trim()}%`), ilike(content.slug, `%${params.search.trim()}%`))!)
  const where = conditions.length ? and(...conditions) : undefined, db = getDb()
  const [rows, [{ total }]] = await Promise.all([
    db.select().from(content).where(where).orderBy(desc(content.updatedAt), desc(content.id)).limit(limit).offset((page - 1) * limit),
    db.select({ total: sql<number>`count(*)::int` }).from(content).where(where),
  ])
  return { data: await Promise.all(rows.map(withAuthor)), total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getDashboardContent(id: string) {
  await requireUser()
  validateContentId(id)
  const [row] = await getDb().select().from(content).where(eq(content.id, id)).limit(1)
  return row ? withAuthor(row) : null
}

export async function createContent(input: unknown) {
  const user = await requireCapability("content:write")
  const value = contentInput.parse(input)
  const body = parseBody(value.body), slug = value.slug || slugFromTitle(value.title)
  if (!slug || !slugSchema.safeParse(slug).success) throw new AppError("VALIDATION", "Title must produce a valid slug")
  const publishedAt = value.status === ContentStatus.published ? (value.publishedAt ? new Date(value.publishedAt) : new Date()) : null
  try {
    const [row] = await getDb().insert(content).values({ title: value.title, slug, type: value.type, status: value.status, body, bodyHtml: sanitizeContentHtml(value.bodyHtml ?? ""), featuredImageUrl: value.featuredImageUrl || null, publishedAt, authorId: user.id }).returning()
    revalidateContentPaths(row.slug)
    return withAuthor(row)
  } catch (error) { return mapDatabaseError(error) }
}

export async function updateContent(id: string, input: unknown) {
  await requireCapability("content:write")
  validateContentId(id)
  const value = contentInput.partial().strict().parse(input)
  if (!Object.keys(value).length) throw new AppError("VALIDATION", "No fields to update")
  const { publishedAt: submittedPublishedAt, ...rest } = value
  const patch: Partial<typeof content.$inferInsert> = { ...rest, ...(submittedPublishedAt !== undefined ? { publishedAt: new Date(submittedPublishedAt) } : {}), ...(value.body !== undefined ? { body: parseBody(value.body) } : {}), ...(value.bodyHtml !== undefined ? { bodyHtml: sanitizeContentHtml(value.bodyHtml) } : {}), updatedAt: new Date() }
  if (value.status === ContentStatus.published && value.publishedAt === undefined) patch.publishedAt = new Date()
  if (value.status && value.status !== ContentStatus.published) patch.publishedAt = null
  try {
    const [previous] = await getDb().select({ slug: content.slug }).from(content).where(eq(content.id, id)).limit(1)
    const [row] = await getDb().update(content).set(patch).where(eq(content.id, id)).returning()
    if (row) revalidateContentPaths(row.slug, previous?.slug)
    return row ? withAuthor(row) : null
  } catch (error) { return mapDatabaseError(error) }
}

export async function removeContent(id: string) {
  await requireCapability("content:write")
  validateContentId(id)
  const [row] = await getDb().delete(content).where(eq(content.id, id)).returning({ slug: content.slug })
  if (row) revalidateContentPaths(undefined, row.slug)
  return !!row
}

function revalidateContentPaths(slug?: string, oldSlug?: string) {
  for (const path of ["/", "/news", "/sermons", "/content"]) revalidatePath(path)
  if (slug) revalidatePath(`/${slug}`)
  if (oldSlug && oldSlug !== slug) revalidatePath(`/${oldSlug}`)
}
