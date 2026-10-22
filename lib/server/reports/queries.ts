import "server-only"
import { desc, eq } from "drizzle-orm"
import { getDb } from "@/lib/server/db"
import { reports } from "@/lib/server/db/schema"
import { requireUser } from "@/lib/server/auth"
import { AppError } from "@/lib/actions/result"

function project(row: typeof reports.$inferSelect) {
  return { ...row.data, id: row.id, tanggal: row.tanggal, jenisKebaktian: row.jenisKebaktian, createdAt: row.createdAt, updatedAt: row.updatedAt }
}
export async function listReports() {
  await requireUser()
  return (await getDb().select().from(reports).orderBy(desc(reports.tanggal), desc(reports.createdAt))).map(project)
}
export async function getReport(id: string) {
  await requireUser()
  const [row] = await getDb().select().from(reports).where(eq(reports.id, id))
  if (!row) throw new AppError("NOT_FOUND", "Report not found")
  return project(row)
}
