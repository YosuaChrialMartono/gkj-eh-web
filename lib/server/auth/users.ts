import "server-only"
import { eq } from "drizzle-orm"
import { hash, compare } from "bcryptjs"
import { z } from "zod"
import { getDb } from "@/lib/server/db"
import { users } from "@/lib/server/db/schema"
import { AppError } from "@/lib/actions/result"
const passwordLimit = z.string().max(72).refine(value => Buffer.byteLength(value, "utf8") <= 72, "Password must be at most 72 UTF-8 bytes")
export const registrationSchema = z.object({ name: z.string().trim().min(1).max(120), email: z.string().trim().toLowerCase().pipe(z.email()), password: passwordLimit.pipe(z.string().min(12)) }).strict()
export async function registerUser(input: unknown) {
  const data = registrationSchema.parse(input)
  const passwordHash = await hash(data.password, 12)
  const [user] = await getDb().insert(users).values({ name: data.name, email: data.email, passwordHash }).onConflictDoNothing({ target: users.email }).returning({ id: users.id })
  if (!user) throw new AppError("CONFLICT", "Account could not be created")
  return user
}
export async function authenticateCredentials(input: unknown) {
  const parsed = z.object({ email: z.string().trim().toLowerCase().pipe(z.email()), password: passwordLimit.pipe(z.string().min(1)) }).safeParse(input)
  if (!parsed.success) return null
  const [user] = await getDb().select().from(users).where(eq(users.email, parsed.data.email)).limit(1)
  if (!user?.passwordHash || user.disabled || !await compare(parsed.data.password, user.passwordHash)) return null
  return { id: user.id, name: user.name, email: user.email, image: user.image }
}
