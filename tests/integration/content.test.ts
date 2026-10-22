import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { inArray } from "drizzle-orm"
import { randomUUID } from "node:crypto"
import * as schema from "@/lib/server/db/schema"

const state = vi.hoisted(() => ({ session: null as null | { user: { id: string }; version: number } }))
const revalidatePath = vi.hoisted(() => vi.fn())
vi.mock("@/auth", () => ({ auth: async () => state.session }))
vi.mock("next/cache", () => ({ revalidatePath }))

const databaseUrl = process.env.TEST_DATABASE_URL
const pool = new Pool({ connectionString: databaseUrl })
const db = drizzle(pool, { schema })
const ids: Record<string, string> = {}
let ready = false

describe("CMS database acceptance", () => {
  beforeAll(async () => {
    if (!databaseUrl || !new URL(databaseUrl).pathname.endsWith("_test")) throw new Error("TEST_DATABASE_URL database name must end _test")
    process.env.DATABASE_URL = databaseUrl
    await migrate(db, { migrationsFolder: "./drizzle" })
    for (const role of ["viewer", "editor", "admin"] as const) {
      const [user] = await db.insert(schema.users).values({ name: role, email: `${role}-${randomUUID()}@cms.test`, role }).returning({ id: schema.users.id })
      ids[role] = user.id
    }
    ready = true
  })
  beforeEach(() => { state.session = null; revalidatePath.mockClear() })
  afterAll(async () => {
    if (ready) {
      await db.delete(schema.content).where(inArray(schema.content.authorId, Object.values(ids)))
      await db.delete(schema.users).where(inArray(schema.users.id, Object.values(ids)))
    }
    await pool.end()
    const globalDb = globalThis as unknown as { gkjPool?: Pool }
    await globalDb.gkjPool?.end()
    delete globalDb.gkjPool
  })

  const draft = (slug: string, extra: Record<string, unknown> = {}) => ({ title: "Church news", slug, type: "article", status: "draft", body: JSON.stringify({ type: "doc", content: [] }), bodyHtml: "<p>News</p>", ...extra })

  it("enforces anonymous/viewer/editor/admin CRUD capability boundaries", async () => {
    const cms = await import("@/lib/server/content/service")
    await expect(cms.createContent(draft(`anonymous-${randomUUID()}`))).rejects.toMatchObject({ code: "UNAUTHENTICATED" })
    state.session = { user: { id: ids.viewer }, version: 0 }
    expect((await cms.listDashboardContent()).total).toBeGreaterThanOrEqual(0)
    await expect(cms.createContent(draft(`viewer-${randomUUID()}`))).rejects.toMatchObject({ code: "FORBIDDEN" })
    state.session = { user: { id: ids.editor }, version: 0 }
    const editorContent = await cms.createContent(draft(`editor-${randomUUID()}`))
    expect((await cms.getDashboardContent(editorContent.id))?.authorName).toBe("editor")
    const updated = await cms.updateContent(editorContent.id, { title: "Updated" })
    expect(updated?.title).toBe("Updated")
    state.session = { user: { id: ids.admin }, version: 0 }
    const adminContent = await cms.createContent(draft(`admin-${randomUUID()}`))
    expect((await cms.getDashboardContent(adminContent.id))?.authorName).toBe("admin")
    expect((await cms.updateContent(adminContent.id, { title: "Admin update" }))?.title).toBe("Admin update")
    expect(await cms.removeContent(adminContent.id)).toBe(true)
    expect(await cms.removeContent(editorContent.id)).toBe(true)
  })

  it("keeps drafts and future publications private and strips server metadata from public projections", async () => {
    const cms = await import("@/lib/server/content/service")
    state.session = { user: { id: ids.editor }, version: 0 }
    await expect(cms.createContent(draft("", { title: "教会だより" }))).rejects.toMatchObject({ code: "VALIDATION" })
    const draftSlug = `draft-${randomUUID()}`, futureSlug = `future-${randomUUID()}`
    const savedDraft = await cms.createContent(draft(draftSlug))
    const future = await cms.createContent(draft(futureSlug, { status: "published", publishedAt: new Date(Date.now() + 60_000).toISOString() }))
    const publicRows = await cms.listPublicContent({ search: "Church news" })
    expect(publicRows.data.map(row => row.slug)).not.toContain(draftSlug)
    expect(publicRows.data.map(row => row.slug)).not.toContain(futureSlug)
    expect(await cms.getPublishedContentBySlug(draftSlug)).toBeNull()
    expect(await cms.getPublishedContentBySlug(futureSlug)).toBeNull()
    state.session = { user: { id: ids.editor }, version: 0 }
    await expect(cms.createContent(draft(`metadata-${randomUUID()}`, { id: randomUUID(), authorId: ids.admin, createdAt: new Date().toISOString() }))).rejects.toMatchObject({ name: "ZodError" })
    const publicSlug = `public-${randomUUID()}`
    const publicItem = await cms.createContent(draft(publicSlug, { status: "published" }))
    const publicProjection = await cms.getPublishedContentBySlug(publicSlug)
    expect(publicProjection).toMatchObject({ id: publicItem.id, authorName: "editor", bodyHtml: "<p>News</p>" })
    expect(publicProjection).not.toHaveProperty("authorId")
    expect(await cms.removeContent(savedDraft.id)).toBe(true)
    expect(await cms.removeContent(future.id)).toBe(true)
    expect(await cms.removeContent(publicItem.id)).toBe(true)
  })

  it("maps nested unique conflicts, validates IDs/pagination, and invalidates old slugs", async () => {
    const cms = await import("@/lib/server/content/service")
    state.session = { user: { id: ids.editor }, version: 0 }
    const slug = `conflict-${randomUUID()}`
    const item = await cms.createContent(draft(slug))
    await expect(cms.createContent(draft(slug))).rejects.toMatchObject({ code: "CONFLICT" })
    await expect(cms.getDashboardContent("not-a-uuid")).rejects.toMatchObject({ name: "ZodError" })
    await expect(cms.listDashboardContent({ page: Number.NaN })).rejects.toMatchObject({ name: "ZodError" })
    const nextSlug = `renamed-${randomUUID()}`
    await cms.updateContent(item.id, { slug: nextSlug })
    expect(revalidatePath).toHaveBeenCalledWith(`/${slug}`)
    expect(revalidatePath).toHaveBeenCalledWith(`/${nextSlug}`)
    revalidatePath.mockClear()
    await cms.removeContent(item.id)
    expect(revalidatePath).toHaveBeenCalledWith(`/${nextSlug}`)
  })
})
