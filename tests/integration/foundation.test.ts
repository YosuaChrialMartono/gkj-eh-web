import { beforeAll, afterAll, describe, it, expect, vi } from "vitest"
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { randomUUID } from "node:crypto"
import { eq } from "drizzle-orm"
import * as s from "@/lib/server/db/schema"
const state = vi.hoisted(() => ({ session: null as null | { user: { id: string }; version: number } }))
vi.mock("@/auth", () => ({ auth: async () => state.session }))
const url = process.env.TEST_DATABASE_URL
describe("fresh PostgreSQL foundation", () => {
  const pool = new Pool({ connectionString: url })
  const db = drizzle(pool)
  const email = `test-${randomUUID()}@gkj.test`
  let userId: string
  let ready = false
  beforeAll(async () => {
    if (!url || !new URL(url).pathname.endsWith("_test")) throw new Error("TEST_DATABASE_URL database name must end _test")
    process.env.DATABASE_URL = url
    await migrate(db, { migrationsFolder: "./drizzle" })
    ready = true
  })
  afterAll(async () => {
    if (ready) await db.delete(s.users).where(eq(s.users.email, email))
    await pool.end()
    const globalDb = globalThis as unknown as { gkjPool?: Pool }
    await globalDb.gkjPool?.end()
    delete globalDb.gkjPool
  })
  it("registers a normalized viewer, verifies passwords, rejects duplicate email", async () => {
    const { registerUser, authenticateCredentials } = await import("@/lib/server/auth/users")
    const user = await registerUser({ name: "Test", email: email.toUpperCase(), password: "long-password-123" })
    userId = user.id
    expect((await authenticateCredentials({ email, password: "long-password-123" }))?.id).toBe(userId)
    expect(await authenticateCredentials({ email, password: "wrong" })).toBeNull()
    await expect(registerUser({ name: "Test", email, password: "long-password-123" })).rejects.toMatchObject({ code: "CONFLICT" })
  })
  it("rejects anonymous, disabled, revoked and deleted identities; reads live roles", async () => {
    const { requireUser, requireCapability, getCurrentUser } = await import("@/lib/server/auth")
    const { updateMyName } = await import("@/lib/server/auth/actions")
    await expect(requireUser()).rejects.toMatchObject({ code: "UNAUTHENTICATED" })
    expect(await updateMyName({ name: "Forged" })).toMatchObject({ ok: false, error: { code: "UNAUTHENTICATED" } })
    state.session = { user: { id: userId }, version: 0 }
    expect(await updateMyName({ name: "New Name", id: randomUUID() })).toMatchObject({ ok: false, error: { code: "VALIDATION" } })
    expect(await updateMyName({ name: "New Name" })).toEqual({ ok: true, data: { name: "New Name" } })
    await expect(requireCapability("reports:write")).rejects.toMatchObject({ code: "FORBIDDEN" })
    await db.update(s.users).set({ role: "editor" }).where(eq(s.users.id, userId))
    expect((await requireCapability("reports:write")).role).toBe("editor")
    await db.update(s.users).set({ disabled: true }).where(eq(s.users.id, userId))
    expect(await getCurrentUser()).toBeNull()
    await db.update(s.users).set({ disabled: false, sessionVersion: 1 }).where(eq(s.users.id, userId))
    expect(await getCurrentUser()).toBeNull()
    state.session = { user: { id: randomUUID() }, version: 0 }
    expect(await getCurrentUser()).toBeNull()
  })
  it("enforces unique slot and atomic concurrent upsert; cascades service deletion", async () => {
    const [role] = await db.insert(s.pelayanRoles).values({ name: randomUUID() }).returning()
    const [service] = await db.insert(s.pelayanServices).values({ date: "2026-10-25", isExtra: true }).returning()
    try {
      await Promise.all(["A", "B"].map(pelayanName => db.insert(s.pelayanAssignments).values({ serviceId: service.id, roleId: role.id, pelayanName }).onConflictDoUpdate({ target: [s.pelayanAssignments.serviceId, s.pelayanAssignments.roleId], set: { pelayanName } })))
      const rows = await db.select().from(s.pelayanAssignments).where(eq(s.pelayanAssignments.serviceId, service.id))
      expect(rows).toHaveLength(1)
      await expect(db.insert(s.pelayanAssignments).values({ serviceId: randomUUID(), roleId: role.id, pelayanName: "Bad FK" })).rejects.toThrow()
      await db.delete(s.pelayanServices).where(eq(s.pelayanServices.id, service.id))
      expect(await db.select().from(s.pelayanAssignments).where(eq(s.pelayanAssignments.serviceId, service.id))).toHaveLength(0)
    } finally {
      await db.delete(s.pelayanServices).where(eq(s.pelayanServices.id, service.id))
      await db.delete(s.pelayanRoles).where(eq(s.pelayanRoles.id, role.id))
    }
  })
  it("enforces author FK and slug uniqueness", async () => {
    const slug = randomUUID()
    const value = { title: "Test", slug, type: "article" as const, authorId: userId }
    try {
      await db.insert(s.content).values(value)
      await expect(db.insert(s.content).values(value)).rejects.toThrow()
      await expect(db.delete(s.users).where(eq(s.users.id, userId))).rejects.toThrow()
    } finally { await db.delete(s.content).where(eq(s.content.slug, slug)) }
  })
  it("deduplicates normalized people", async () => {
    const name = randomUUID()
    const [person] = await db.insert(s.pelayanPersons).values({ name }).returning()
    try { await expect(db.insert(s.pelayanPersons).values({ name: ` ${name.toUpperCase()} ` })).rejects.toThrow() }
    finally { await db.delete(s.pelayanPersons).where(eq(s.pelayanPersons.id, person.id)) }
  })
})
