"use server"
import { signOut } from "@/auth"
import { eq, sql } from "drizzle-orm"
import { z } from "zod"
import { getDb } from "@/lib/server/db"
import { users } from "@/lib/server/db/schema"
import { requireUser } from "./index"
import { registerUser } from "./users"
import { actionResult } from "@/lib/server/action"
export async function registerAction(input: unknown) { return actionResult(() => registerUser(input)) }
// Protected action example; derives target identity from session, not client input.
export async function updateMyName(input: unknown) {
  return actionResult(async () => {
    const user = await requireUser()
    const { name } = z.object({ name: z.string().trim().min(1).max(120) }).strict().parse(input)
    await getDb().update(users).set({ name, updatedAt: new Date() }).where(eq(users.id, user.id))
    return { name }
  })
}
export async function logoutAction() {
  const { getCurrentUser } = await import("./index")
  const user = await getCurrentUser()
  if (user) await getDb().update(users).set({ sessionVersion: sql`${users.sessionVersion} + 1` }).where(eq(users.id, user.id))
  await signOut({ redirectTo: "/login" })
}
