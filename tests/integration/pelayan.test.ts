import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { randomUUID } from "node:crypto"
import { and, eq } from "drizzle-orm"
import * as schema from "@/lib/server/db/schema"

const sessionState = vi.hoisted(() => ({ session: null as null | { user: { id: string }; version: number } }))
vi.mock("@/auth", () => ({ auth: async () => sessionState.session }))

const url = process.env.TEST_DATABASE_URL
describe("Pelayan domain actions", () => {
  const pool = new Pool({ connectionString: url })
  const db = drizzle(pool)
  const email = `pelayan-${randomUUID()}@gkj.test`
  let userId: string
  let ready = false

  beforeAll(async () => {
    if (!url || !new URL(url).pathname.endsWith("_test")) throw new Error("TEST_DATABASE_URL database name must end _test")
    process.env.DATABASE_URL = url
    await migrate(db, { migrationsFolder: "./drizzle" })
    ready = true
    const [user] = await db.insert(schema.users).values({ name: "Pelayan test", email, role: "admin" }).returning()
    userId = user.id
    sessionState.session = { user: { id: userId }, version: 0 }
  })

  afterAll(async () => {
    if (ready) await db.delete(schema.users).where(eq(schema.users.email, email))
    await pool.end()
    const globalDb = globalThis as unknown as { gkjPool?: Pool }
    await globalDb.gkjPool?.end()
    delete globalDb.gkjPool
  })

  it("enforces authentication and capability split", async () => {
    const { savePelayanRole, savePelayanService } = await import("@/lib/server/pelayan")
    sessionState.session = null
    expect(await savePelayanService({ date: "2026-11-01" })).toMatchObject({ ok: false, error: { code: "UNAUTHENTICATED" } })
    sessionState.session = { user: { id: userId }, version: 0 }
    await db.update(schema.users).set({ role: "viewer" }).where(eq(schema.users.id, userId))
    expect(await savePelayanService({ date: "2026-11-01" })).toMatchObject({ ok: false, error: { code: "FORBIDDEN" } })
    expect(await savePelayanRole({ name: "Viewers cannot add roles" })).toMatchObject({ ok: false, error: { code: "FORBIDDEN" } })
    await db.update(schema.users).set({ role: "admin" }).where(eq(schema.users.id, userId))
  })

  it("supports role/person/service CRUD, month boundaries and assignment clear", async () => {
    const { getPelayanMonth, savePelayanRole, removePelayanRole, createPelayanPerson, removePelayanPerson, savePelayanService, removePelayanService, replacePelayanAssignments } = await import("@/lib/server/pelayan")
    const roleResult = await savePelayanRole({ name: `Role ${randomUUID()}`, order: 1 })
    expect(roleResult.ok).toBe(true)
    if (!roleResult.ok) return
    const roleId = roleResult.data.id
    const personResult = await createPelayanPerson(`Person ${randomUUID()}`)
    expect(personResult.ok).toBe(true)
    if (!personResult.ok) return
    const personId = personResult.data.id
    const startResult = await savePelayanService({ date: "2026-11-01", label: "Sunday" })
    const endResult = await savePelayanService({ date: "2026-12-01", isExtra: true })
    expect(startResult.ok && endResult.ok).toBe(true)
    if (!startResult.ok || !endResult.ok) return
    try {
      expect((await getPelayanMonth("2026-11")).services.map((service) => service.id)).toContain(startResult.data.id)
      expect((await getPelayanMonth("2026-11")).services.map((service) => service.id)).not.toContain(endResult.data.id)
      expect(await replacePelayanAssignments(startResult.data.id, [{ roleId, pelayanName: "Ada" }])).toEqual({ ok: true, data: true })
      expect(await replacePelayanAssignments(startResult.data.id, [{ roleId }])).toEqual({ ok: true, data: true })
      expect(await db.select().from(schema.pelayanAssignments).where(eq(schema.pelayanAssignments.serviceId, startResult.data.id))).toHaveLength(0)
    } finally {
      await removePelayanService(startResult.data.id)
      await removePelayanService(endResult.data.id)
      await removePelayanPerson(personId)
      await removePelayanRole(roleId)
    }
  })

  it("concurrently materializes one regular Sunday and upserts one assignment slot", async () => {
    const { assignPelayan } = await import("@/lib/server/pelayan")
    const roleName = `Concurrent ${randomUUID()}`
    const [role] = await db.insert(schema.pelayanRoles).values({ name: roleName }).returning()
    try {
      const results = await Promise.all(["One", "Two"].map((pelayanName) => assignPelayan({ date: "2026-11-08", roleId: role.id, pelayanName })))
      expect(results.every((result) => result.ok)).toBe(true)
      const services = await db.select().from(schema.pelayanServices).where(and(eq(schema.pelayanServices.date, "2026-11-08"), eq(schema.pelayanServices.isExtra, false)))
      expect(services).toHaveLength(1)
      const assignments = await db.select().from(schema.pelayanAssignments).where(and(eq(schema.pelayanAssignments.serviceId, services[0].id), eq(schema.pelayanAssignments.roleId, role.id)))
      expect(assignments).toHaveLength(1)
      expect(["One", "Two"]).toContain(assignments[0].pelayanName)
    } finally {
      await db.delete(schema.pelayanServices).where(eq(schema.pelayanServices.date, "2026-11-08"))
      await db.delete(schema.pelayanRoles).where(eq(schema.pelayanRoles.id, role.id))
    }
  })
})
