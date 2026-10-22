import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { AppError } from "@/lib/actions/result"

export function contentErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    const status = error.code === "UNAUTHENTICATED" ? 401 : error.code === "FORBIDDEN" ? 403 : error.code === "NOT_FOUND" ? 404 : error.code === "CONFLICT" ? 409 : 400
    return NextResponse.json({ message: error.message, code: error.code }, { status })
  }
  if (error instanceof ZodError) return NextResponse.json({ message: "Invalid content request", code: "VALIDATION", fields: error.flatten().fieldErrors }, { status: 400 })
  console.error("Content API failed", error)
  return NextResponse.json({ message: "Content operation failed" }, { status: 500 })
}
