import { NextRequest, NextResponse } from "next/server"
import { getContentList, createContent } from "@/lib/api/content"
import { getAccessTokenFromRequest } from "@/lib/auth/server-utils"
import type { ContentListParams, ContentCreateInput } from "@/lib/types"

export async function GET(req: NextRequest) {
  try {
    const token = getAccessTokenFromRequest(req)
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const { searchParams } = req.nextUrl
    const params: ContentListParams = {
      page: searchParams.has("page") ? Number(searchParams.get("page")) : undefined,
      limit: searchParams.has("limit") ? Number(searchParams.get("limit")) : undefined,
      type: searchParams.get("type") as ContentListParams["type"] ?? undefined,
      status: searchParams.get("status") as ContentListParams["status"] ?? undefined,
      search: searchParams.get("search") ?? undefined,
    }

    const data = await getContentList(token, params)
    return NextResponse.json(data)
  } catch (err) {
    const error = err as { message?: string; status?: number }
    return NextResponse.json({ message: error.message ?? "Failed" }, { status: error.status ?? 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getAccessTokenFromRequest(req)
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    const body = await req.json() as ContentCreateInput
    const data = await createContent(token, body)
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const error = err as { message?: string; status?: number }
    return NextResponse.json({ message: error.message ?? "Failed" }, { status: error.status ?? 500 })
  }
}
