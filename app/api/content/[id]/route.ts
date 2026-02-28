import { NextRequest, NextResponse } from "next/server"
import { getContentById, updateContent, deleteContent } from "@/lib/api/content"
import { getAccessTokenFromRequest } from "@/lib/auth/server-utils"
import type { ContentUpdateInput } from "@/lib/types"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = getAccessTokenFromRequest(req)
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    const { id } = await params
    const data = await getContentById(token, id)
    return NextResponse.json(data)
  } catch (err) {
    const error = err as { message?: string; status?: number }
    return NextResponse.json({ message: error.message ?? "Failed" }, { status: error.status ?? 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = getAccessTokenFromRequest(req)
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    const { id } = await params
    const body = await req.json() as ContentUpdateInput
    const data = await updateContent(token, id, body)
    return NextResponse.json(data)
  } catch (err) {
    const error = err as { message?: string; status?: number }
    return NextResponse.json({ message: error.message ?? "Failed" }, { status: error.status ?? 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = getAccessTokenFromRequest(req)
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    const { id } = await params
    await deleteContent(token, id)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    const error = err as { message?: string; status?: number }
    return NextResponse.json({ message: error.message ?? "Failed" }, { status: error.status ?? 500 })
  }
}
