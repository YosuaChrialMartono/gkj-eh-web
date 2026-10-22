import { NextRequest, NextResponse } from "next/server"
import { AppError } from "@/lib/actions/result"
import { createContent, getContentList } from "@/lib/api/content"
import { ContentStatus, ContentType } from "@/lib/types/content"

function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    const status = error.code === "UNAUTHENTICATED" ? 401 : error.code === "FORBIDDEN" ? 403 : error.code === "NOT_FOUND" ? 404 : error.code === "CONFLICT" ? 409 : 400
    return NextResponse.json({ message: error.message, code: error.code }, { status })
  }
  console.error("Content API failed", error)
  return NextResponse.json({ message: "Content operation failed" }, { status: 500 })
}

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams
  const type = search.get("type"), status = search.get("status")
  try {
    return NextResponse.json(await getContentList({ page: Number(search.get("page") || 1), limit: Number(search.get("limit") || 10), search: search.get("search") || undefined, type: Object.values(ContentType).includes(type as ContentType) ? type as ContentType : undefined, status: Object.values(ContentStatus).includes(status as ContentStatus) ? status as ContentStatus : undefined }))
  } catch (error) { return errorResponse(error) }
}

export async function POST(req: NextRequest) {
  try { return NextResponse.json(await createContent(await req.json()), { status: 201 }) }
  catch (error) { return errorResponse(error) }
}
