import { NextRequest, NextResponse } from "next/server"
import { AppError } from "@/lib/actions/result"
import { deleteContent, getContentById, updateContent } from "@/lib/api/content"

type RouteContext = { params: Promise<{ id: string }> }
function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    const status = error.code === "UNAUTHENTICATED" ? 401 : error.code === "FORBIDDEN" ? 403 : error.code === "NOT_FOUND" ? 404 : error.code === "CONFLICT" ? 409 : 400
    return NextResponse.json({ message: error.message, code: error.code }, { status })
  }
  console.error("Content API failed", error)
  return NextResponse.json({ message: "Content operation failed" }, { status: 500 })
}
export async function GET(_req: NextRequest, context: RouteContext) {
  try { return NextResponse.json(await getContentById((await context.params).id)) } catch (error) { return errorResponse(error) }
}
export async function PUT(req: NextRequest, context: RouteContext) {
  try { return NextResponse.json(await updateContent((await context.params).id, await req.json())) } catch (error) { return errorResponse(error) }
}
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try { await deleteContent((await context.params).id); return NextResponse.json({ ok: true }) } catch (error) { return errorResponse(error) }
}
