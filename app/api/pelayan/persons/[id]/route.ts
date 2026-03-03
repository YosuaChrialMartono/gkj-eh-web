import { NextRequest, NextResponse } from "next/server"
import { deletePerson } from "@/lib/api/pelayan"

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await deletePerson(id)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    const error = err as { message?: string; status?: number }
    return NextResponse.json({ message: error.message ?? "Failed" }, { status: error.status ?? 500 })
  }
}
