import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { hash } from "bcryptjs"
import * as s from "../lib/server/db/schema"
import { defaultFormValues } from "../lib/form-defaults"

async function main() {
  if (process.env.NODE_ENV === "production" || process.env.ALLOW_DEV_SEED !== "yes") throw new Error("Development seed only: set ALLOW_DEV_SEED=yes explicitly")
  if (!process.env.DATABASE_URL || !process.env.SEED_PASSWORD || process.env.SEED_PASSWORD.length < 12) throw new Error("DATABASE_URL and SEED_PASSWORD (12+ characters) required")
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  try {
    const db = drizzle(pool)
    const passwordHash = await hash(process.env.SEED_PASSWORD, 12)
    await db.transaction(async tx => {
      for (const role of ["admin", "editor", "viewer"] as const) {
        await tx.insert(s.users).values({ id: `00000000-0000-4000-8000-00000000000${role === "admin" ? 1 : role === "editor" ? 2 : 3}`, name: `${role} demo`, email: `${role}@gkj.test`, passwordHash, role }).onConflictDoNothing()
      }
      const authorId = "00000000-0000-4000-8000-000000000001"
      for (const status of ["published", "draft", "archived"] as const) {
        await tx.insert(s.content).values({ title: `Welcome (${status})`, slug: `demo-${status}`, type: "article", status, body: JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Selamat datang" }] }] }), bodyHtml: "<p>Selamat datang</p>", authorId, publishedAt: status === "published" ? new Date() : null }).onConflictDoNothing()
      }
      const roleId = "00000000-0000-4000-8000-000000000010"
      const serviceId = "00000000-0000-4000-8000-000000000011"
      await tx.insert(s.pelayanRoles).values({ id: roleId, name: "Pelayan Firman", order: 1 }).onConflictDoNothing()
      await tx.insert(s.pelayanPersons).values({ name: "Pdt. Demo" }).onConflictDoNothing()
      await tx.insert(s.pelayanServices).values({ id: serviceId, date: "2026-10-25", label: "Ibadah Minggu" }).onConflictDoNothing()
      await tx.insert(s.pelayanAssignments).values({ serviceId, roleId, pelayanName: "Pdt. Demo" }).onConflictDoNothing()
      const { tanggal, jenisKebaktian, ...data } = { ...defaultFormValues(), tanggal: "2026-10-25", jenisKebaktian: "Minggu", pelayanFirman: "Pdt. Demo", perikopBacaan: "Yohanes 3:16", temaRenungan: "Kasih" }
      await tx.insert(s.reports).values({ id: "00000000-0000-4000-8000-000000000020", tanggal, jenisKebaktian, data }).onConflictDoNothing()
    })
    console.log("Demo fixtures ready; existing rows/passwords were not overwritten.")
  } finally { await pool.end() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
