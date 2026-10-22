export type ErrorCode = "UNAUTHENTICATED" | "FORBIDDEN" | "VALIDATION" | "NOT_FOUND" | "CONFLICT" | "INTERNAL"
export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: { code: ErrorCode; message: string; fields?: Record<string, string[]> } }
export class AppError extends Error {
  constructor(public code: ErrorCode, message: string) { super(message) }
}
