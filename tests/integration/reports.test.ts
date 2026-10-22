import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import { randomUUID } from "node:crypto"
import { eq } from "drizzle-orm"
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import * as schema from "@/lib/server/db/schema"

const state = vi.hoisted(() => ({ session: null as null | { user: { id: string }; version: number } }))
vi.mock("@/auth", () => ({ auth: async () => state.session }))

const url = process.env.TEST_DATABASE_URL
describe("report persistence and actions", () => {
  const pool = new Pool({ connectionString: url })
  const db = drizzle(pool)
  const email = `reports-${randomUUID()}@gkj.test`
  let userId: string

  beforeAll(async () => {
    if (!url || !new URL(url).pathname.endsWith("_test")) throw new Error("TEST_DATABASE_URL database name must end _test")
    process.env.DATABASE_URL = url
    await migrate(db, { migrationsFolder: "./drizzle" })
    const { registerUser } = await import("@/lib/server/auth/users")
    userId = (await registerUser({ name: "Report integration", email, password: "report-test-password-123" })).id
    await db.update(schema.users).set({ role: "editor" }).where(eq(schema.users.id, userId))
  })

  afterAll(async () => {
    state.session = null
    if (userId) await db.delete(schema.users).where(eq(schema.users.id, userId))
    await pool.end()
    const globalDb = globalThis as unknown as { gkjPool?: Pool }
    await globalDb.gkjPool?.end()
    delete globalDb.gkjPool
  })

  it("authorizes and persists full replacement CRUD without accepting client metadata", async () => {
    const { defaultFormValues } = await import("@/lib/form-defaults")
    const { saveReport, deleteReport } = await import("@/lib/server/reports/actions")
    const { listReports, getReport } = await import("@/lib/server/reports/queries")
    const form = { ...defaultFormValues(), jenisKebaktian: "Minggu", pelayanFirman: "Pdt. Test" }
    expect(await saveReport(form)).toMatchObject({ ok: false, error: { code: "UNAUTHENTICATED" } })
    state.session = { user: { id: userId }, version: 0 }

    const forgedId = randomUUID()
    const created = await saveReport({ ...form, id: forgedId, createdAt: "forged", updatedAt: "forged" })
    expect(created.ok).toBe(true)
    if (!created.ok) throw new Error("expected report creation to succeed")
    const id = created.data.id
    try {
      expect(id).not.toBe(forgedId)
      expect((await getReport(id) as unknown as { pelayanFirman: string }).pelayanFirman).toBe("Pdt. Test")

      const changed = await saveReport({ ...form, tanggal: "2026-10-23", pelayanFirman: "Pdt. Replacement" }, id)
      expect(changed.ok).toBe(true)
      expect((await getReport(id) as unknown as { pelayanFirman: string }).pelayanFirman).toBe("Pdt. Replacement")
      expect((await listReports()).some(report => report.id === id)).toBe(true)
      expect(await saveReport({ ...form, tanggal: "not-a-date" }, id)).toMatchObject({ ok: false, error: { code: "VALIDATION" } })
      expect(await deleteReport(id)).toEqual({ ok: true, data: { id } })
      await expect(getReport(id)).rejects.toMatchObject({ code: "NOT_FOUND" })
    } finally {
      await db.delete(schema.reports).where(eq(schema.reports.id, id))
      state.session = null
    }
  })
})
