import "server-only"
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "./schema"
// Lazy: static builds need no live DB. Do not use a Nest-owned database.
const globalDb = globalThis as unknown as { gkjPool?: Pool }
export function getDb() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required")
  const pool = globalDb.gkjPool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 10 })
  return drizzle(pool, { schema })
}
