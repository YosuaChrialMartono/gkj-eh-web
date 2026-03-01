import { NextRequest, NextResponse } from "next/server"
import { updateRole, deleteRole } from "@/lib/api/pelayan"
import { getAccessTokenFromRequest } from "@/lib/auth/server-utils"
import type { PelayanRoleInput } from "@/lib/types"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = getAccessTokenFromRequest(req)
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    const { id } = await params
    const body = await req.json() as PelayanRoleInput
    const data = await updateRole(token, id, body)
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
    await deleteRole(token, id)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    const error = err as { message?: string; status?: number }
    return NextResponse.json({ message: error.message ?? "Failed" }, { status: error.status ?? 500 })
  }
}
