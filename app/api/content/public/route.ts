import { NextRequest, NextResponse } from "next/server"
import { getPublicContentList } from "@/lib/api/content"
import type { ContentListParams } from "@/lib/types"

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
    const data = await getPublicContentList(params)
    return NextResponse.json(data)
  } catch (err) {
    const error = err as { message?: string; status?: number }
    return NextResponse.json({ message: error.message ?? "Failed" }, { status: error.status ?? 500 })
  }
}
