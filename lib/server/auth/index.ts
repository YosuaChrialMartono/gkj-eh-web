import "server-only"
import { auth } from "@/auth"
import { eq } from "drizzle-orm"
import { getDb } from "@/lib/server/db"
import { users } from "@/lib/server/db/schema"
import { AppError } from "@/lib/actions/result"
import { assertCapability, type Capability, type Role } from "@/lib/auth/policy"
export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) return null
  const [row] = await getDb().select({ id: users.id, name: users.name, email: users.email, avatar: users.image, role: users.role, disabled: users.disabled, version: users.sessionVersion }).from(users).where(eq(users.id, session.user.id)).limit(1)
  if (!row || row.disabled || row.version !== (session as unknown as { version: number }).version) return null
  return { id: row.id, name: row.name, email: row.email, avatar: row.avatar, role: row.role }
}
export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) throw new AppError("UNAUTHENTICATED", "Sign in required")
  return user
}
export async function requireRole(...roles: Role[]) {
  const user = await requireUser()
  if (!roles.includes(user.role)) throw new AppError("FORBIDDEN", "Permission denied")
  return user
}
export async function requireCapability(capability: Capability) {
  const user = await requireUser()
  assertCapability(user.role, capability)
  return user
}
