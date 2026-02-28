import { NextRequest, NextResponse } from "next/server"
import { getContentBySlug } from "@/lib/api/content"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const data = await getContentBySlug(slug)
    return NextResponse.json(data)
  } catch (err) {
    const error = err as { message?: string; status?: number }
    return NextResponse.json({ message: error.message ?? "Not found" }, { status: error.status ?? 404 })
  }
}
