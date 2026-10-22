import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required; use a fresh Next-owned database")
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  try { await migrate(drizzle(pool), { migrationsFolder: "./drizzle" }) } finally { await pool.end() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
