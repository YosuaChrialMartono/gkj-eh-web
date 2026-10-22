import "server-only"
import { z } from "zod"
const schema = z.object({
  DATABASE_URL: z.url().refine(v => /^postgres(ql)?:/.test(v), "Must be a PostgreSQL URL"),
  AUTH_SECRET: z.string().min(32),
  AUTH_GOOGLE_ID: z.string().optional(), AUTH_GOOGLE_SECRET: z.string().optional(),
}).refine(v => !!v.AUTH_GOOGLE_ID === !!v.AUTH_GOOGLE_SECRET, "Set both Google credentials or neither")
export function getServerEnv() { return schema.parse(process.env) }
