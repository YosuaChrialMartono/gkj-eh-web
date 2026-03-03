import { NextRequest, NextResponse } from "next/server"
import { getRoles, createRole } from "@/lib/api/pelayan"
import type { PelayanRoleInput } from "@/lib/types"

export async function GET() {
  try {
    const data = await getRoles()
    return NextResponse.json(data)
  } catch (err) {
    const error = err as { message?: string; status?: number }
    return NextResponse.json({ message: error.message ?? "Failed" }, { status: error.status ?? 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as PelayanRoleInput
    const data = await createRole(body)
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const error = err as { message?: string; status?: number }
    return NextResponse.json({ message: error.message ?? "Failed" }, { status: error.status ?? 500 })
  }
}
