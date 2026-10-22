import "server-only"
import { asc } from "drizzle-orm"
import { getDb } from "@/lib/server/db"
import { pelayanPersons } from "@/lib/server/db/schema"
import { requireUser } from "@/lib/server/auth"
// Server-only query example and shared Reports/Pelayan member projection.
// Protected reads throw AppError; they are never cached globally or converted to [].
export async function listMemberNames(): Promise<string[]> {
  await requireUser()
  const rows = await getDb().select({ name: pelayanPersons.name }).from(pelayanPersons).orderBy(asc(pelayanPersons.name), asc(pelayanPersons.id))
  return rows.map(row => row.name)
}
