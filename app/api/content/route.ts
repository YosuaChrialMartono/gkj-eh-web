import { NextRequest, NextResponse } from "next/server"
import { createContent, getContentList } from "@/lib/api/content"
import { ContentStatus, ContentType } from "@/lib/types/content"
import { z } from "zod"
import { contentErrorResponse } from "./errors"

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams
  const type = search.get("type"), status = search.get("status")
  try {
    return NextResponse.json(await getContentList({ page: search.has("page") ? Number(search.get("page")) : 1, limit: search.has("limit") ? Number(search.get("limit")) : 10, search: search.get("search") || undefined, type: type ? z.nativeEnum(ContentType).parse(type) : undefined, status: status ? z.nativeEnum(ContentStatus).parse(status) : undefined }))
  } catch (error) { return contentErrorResponse(error) }
}

export async function POST(req: NextRequest) {
  try { return NextResponse.json(await createContent(await req.json()), { status: 201 }) }
  catch (error) { return contentErrorResponse(error) }
}
