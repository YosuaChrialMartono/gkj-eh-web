import { NextRequest, NextResponse } from "next/server"
import { getContentList, createContent } from "@/lib/api/content"
import type { ContentListParams, ContentCreateInput } from "@/lib/types"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const params: ContentListParams = {
      page: searchParams.has("page") ? Number(searchParams.get("page")) : undefined,
      limit: searchParams.has("limit") ? Number(searchParams.get("limit")) : undefined,
      type: searchParams.get("type") as ContentListParams["type"] ?? undefined,
      status: searchParams.get("status") as ContentListParams["status"] ?? undefined,
      search: searchParams.get("search") ?? undefined,
    }

    const data = await getContentList(params)
    return NextResponse.json(data)
  } catch (err) {
    const error = err as { message?: string; status?: number }
    return NextResponse.json({ message: error.message ?? "Failed" }, { status: error.status ?? 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ContentCreateInput
    const data = await createContent(body)
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const error = err as { message?: string; status?: number }
    return NextResponse.json({ message: error.message ?? "Failed" }, { status: error.status ?? 500 })
  }
}
