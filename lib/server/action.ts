import "server-only"
import { ZodError } from "zod"
import { AppError, type ActionResult } from "@/lib/actions/result"
export async function actionResult<T>(operation: () => Promise<T>): Promise<ActionResult<T>> {
  try { return { ok: true, data: await operation() } } catch (error) {
    if (error instanceof AppError) return { ok: false, error: { code: error.code, message: error.message } }
    if (error instanceof ZodError) {
      const fields: Record<string, string[]> = {}
      for (const issue of error.issues) (fields[issue.path.join(".")] ??= []).push(issue.message)
      return { ok: false, error: { code: "VALIDATION", message: "Invalid input", fields } }
    }
    console.error("Server operation failed", error)
    return { ok: false, error: { code: "INTERNAL", message: "Operation failed" } }
  }
}
