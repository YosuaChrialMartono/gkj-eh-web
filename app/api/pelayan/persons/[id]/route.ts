import { NextRequest, NextResponse } from "next/server"
import { deletePerson } from "@/lib/api/pelayan"
import { getAccessTokenFromRequest } from "@/lib/auth/server-utils"

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = getAccessTokenFromRequest(req)
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    const { id } = await params
    await deletePerson(token, id)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    const error = err as { message?: string; status?: number }
    return NextResponse.json({ message: error.message ?? "Failed" }, { status: error.status ?? 500 })
  }
}
