"use server"
import { eq } from "drizzle-orm"
import { getDb } from "@/lib/server/db"
import { reports } from "@/lib/server/db/schema"
import { requireCapability } from "@/lib/server/auth"
import { actionResult } from "@/lib/server/action"
import { AppError } from "@/lib/actions/result"
import { parseReportReplacement } from "@/lib/server/report-contract"
import { revalidatePath } from "next/cache"

export async function saveReport(input: unknown, id?: string) {
  return actionResult(async () => {
    await requireCapability("reports:write")
    const replacement = parseReportReplacement(input)
    const db = getDb()
    const [row] = id
      ? await db.update(reports).set({ ...replacement, updatedAt: new Date() }).where(eq(reports.id, id)).returning()
      : await db.insert(reports).values({ ...replacement, createdAt: new Date(), updatedAt: new Date() }).returning()
    if (!row) throw new AppError("NOT_FOUND", "Report not found")
    revalidatePath("/laporan"); revalidatePath("/statistik")
    return row
  })
}

export async function deleteReport(id: string) {
  return actionResult(async () => {
    await requireCapability("reports:write")
    const [row] = await getDb().delete(reports).where(eq(reports.id, id)).returning({ id: reports.id })
    if (!row) throw new AppError("NOT_FOUND", "Report not found")
    revalidatePath("/laporan"); revalidatePath("/statistik")
    return row
  })
}
