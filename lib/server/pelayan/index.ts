import "server-only"
import { and, asc, eq, gte, inArray, lt, notInArray, sql } from "drizzle-orm"
import { z } from "zod"
import { getDb } from "@/lib/server/db"
import { pelayanAssignments, pelayanPersons, pelayanRoles, pelayanServices } from "@/lib/server/db/schema"
import { requireCapability, requireUser } from "@/lib/server/auth"
import { actionResult } from "@/lib/server/action"
import { dateOnlySchema, monthSchema } from "@/lib/schemas/dates"
import type { PelayanAssignmentInput, PelayanRoleInput, PelayanServiceInput } from "@/lib/types"

const idSchema = z.string().uuid()
const roleInput = z.object({ name: z.string().trim().min(1).max(120), order: z.number().int().optional() })
const serviceInput = z.object({ date: dateOnlySchema, label: z.string().trim().max(200).optional(), isExtra: z.boolean().optional() })
const assignmentInput = z.object({ serviceId: idSchema, roleId: idSchema, pelayanName: z.string().trim().min(1).max(200) })

export async function getPelayanMonth(month: string) {
  await requireUser()
  const value = monthSchema.parse(month)
  const start = `${value}-01`
  const [year, mon] = value.split("-").map(Number)
  const end = new Date(Date.UTC(year, mon, 1)).toISOString().slice(0, 10)
  const db = getDb()
  const [roles, persons, services] = await Promise.all([
    db.select().from(pelayanRoles).orderBy(asc(pelayanRoles.order), asc(pelayanRoles.name)),
    db.select().from(pelayanPersons).orderBy(asc(pelayanPersons.name)),
    db.select().from(pelayanServices).where(and(gte(pelayanServices.date, start), lt(pelayanServices.date, end))).orderBy(asc(pelayanServices.date)),
  ])
  const ids = services.map((s) => s.id)
  const assignments = ids.length ? await db.select().from(pelayanAssignments).where(inArray(pelayanAssignments.serviceId, ids)) : []
  return { roles, persons, services, assignments }
}

export async function listPelayanRoles() { await requireUser(); return getDb().select().from(pelayanRoles).orderBy(asc(pelayanRoles.order), asc(pelayanRoles.name)) }
export async function listPelayanPersons() { await requireUser(); return getDb().select().from(pelayanPersons).orderBy(asc(pelayanPersons.name)) }

export async function savePelayanRole(input: PelayanRoleInput, id?: string) { return actionResult(async () => {
  await requireCapability("roles:manage"); const data = roleInput.parse(input); const db = getDb()
  if (id) return (await db.update(pelayanRoles).set(data).where(eq(pelayanRoles.id, idSchema.parse(id))).returning())[0]
  return (await db.insert(pelayanRoles).values(data).returning())[0]
}) }
export async function removePelayanRole(id: string) { return actionResult(async () => { await requireCapability("roles:manage"); await getDb().delete(pelayanRoles).where(eq(pelayanRoles.id, idSchema.parse(id))); return true }) }
export async function createPelayanPerson(name: string) { return actionResult(async () => {
  await requireCapability("pelayan:write"); const clean = z.string().trim().min(1).max(200).parse(name)
  const db = getDb()
  const [existing] = await db.select().from(pelayanPersons).where(sql`lower(trim(${pelayanPersons.name})) = lower(trim(${clean}))`).limit(1)
  if (existing) return existing
  return db.insert(pelayanPersons).values({ name: clean }).returning().then((rows) => rows[0])
}) }
export async function removePelayanPerson(id: string) { return actionResult(async () => { await requireCapability("pelayan:write"); await getDb().delete(pelayanPersons).where(eq(pelayanPersons.id, idSchema.parse(id))); return true }) }

export async function savePelayanService(input: PelayanServiceInput, id?: string) { return actionResult(async () => {
  await requireCapability("pelayan:write"); const data = serviceInput.parse(input); const db = getDb()
  if (id) return (await db.update(pelayanServices).set(data).where(eq(pelayanServices.id, idSchema.parse(id))).returning())[0]
  if (data.isExtra) return (await db.insert(pelayanServices).values(data).returning())[0]
  return db.transaction(async (tx) => (await tx.insert(pelayanServices).values(data).onConflictDoUpdate({ target: pelayanServices.date, targetWhere: sql`NOT ${pelayanServices.isExtra}`, set: { label: data.label ?? null }}).returning())[0])
}) }
export async function removePelayanService(id: string) { return actionResult(async () => { await requireCapability("pelayan:write"); await getDb().delete(pelayanServices).where(eq(pelayanServices.id, idSchema.parse(id))); return true }) }

export async function savePelayanAssignment(input: PelayanAssignmentInput) { return actionResult(async () => {
  await requireCapability("pelayan:write"); const data = assignmentInput.parse(input); const db = getDb()
  return db.transaction(async (tx) => (await tx.insert(pelayanAssignments).values(data).onConflictDoUpdate({ target: [pelayanAssignments.serviceId, pelayanAssignments.roleId], set: { pelayanName: data.pelayanName }}).returning())[0])
}) }
export async function assignPelayan(input: { serviceId?: string; date?: string; roleId: string; pelayanName: string }) { return actionResult(async () => {
  await requireCapability("pelayan:write")
  const data = z.object({ serviceId: idSchema.optional(), date: dateOnlySchema.optional(), roleId: idSchema, pelayanName: z.string().trim().min(1).max(200) }).refine((v) => Boolean(v.serviceId) !== Boolean(v.date)).parse(input)
  const db = getDb()
  return db.transaction(async (tx) => {
    const service = data.serviceId
      ? (await tx.select().from(pelayanServices).where(eq(pelayanServices.id, data.serviceId)))[0]
      : (await tx.insert(pelayanServices).values({ date: data.date!, isExtra: false }).onConflictDoUpdate({ target: pelayanServices.date, targetWhere: sql`NOT ${pelayanServices.isExtra}`, set: { date: data.date! } }).returning())[0]
    if (!service) throw new Error("Layanan tidak ditemukan")
    const assignment = (await tx.insert(pelayanAssignments).values({ serviceId: service.id, roleId: data.roleId, pelayanName: data.pelayanName }).onConflictDoUpdate({ target: [pelayanAssignments.serviceId, pelayanAssignments.roleId], set: { pelayanName: data.pelayanName } }).returning())[0]
    return { assignment, service }
  })
}) }
export async function removePelayanAssignment(id: string) { return actionResult(async () => { await requireCapability("pelayan:write"); await getDb().delete(pelayanAssignments).where(eq(pelayanAssignments.id, idSchema.parse(id))); return true }) }
export async function replacePelayanAssignments(serviceId: string, entries: Array<{ roleId: string; pelayanName?: string }>) { return actionResult(async () => {
  await requireCapability("pelayan:write"); const sid = idSchema.parse(serviceId); const data = z.array(z.object({ roleId: idSchema, pelayanName: z.string().trim().max(200).optional() })).parse(entries); const db = getDb()
  return db.transaction(async (tx) => {
    const [service] = await tx.select({ id: pelayanServices.id }).from(pelayanServices).where(eq(pelayanServices.id, sid))
    if (!service) throw new Error("Layanan tidak ditemukan")
    for (const entry of data) if (entry.pelayanName) await tx.insert(pelayanAssignments).values({ serviceId: sid, roleId: entry.roleId, pelayanName: entry.pelayanName }).onConflictDoUpdate({ target: [pelayanAssignments.serviceId, pelayanAssignments.roleId], set: { pelayanName: entry.pelayanName } })
    const keep = data.filter((entry) => entry.pelayanName).map((entry) => entry.roleId)
    if (keep.length) await tx.delete(pelayanAssignments).where(and(eq(pelayanAssignments.serviceId, sid), notInArray(pelayanAssignments.roleId, keep)))
    else await tx.delete(pelayanAssignments).where(eq(pelayanAssignments.serviceId, sid))
    return true
  })
}) }
