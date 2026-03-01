import { NextRequest, NextResponse } from "next/server"
import { getAssignments, upsertAssignment } from "@/lib/api/pelayan"
import { getAccessTokenFromRequest } from "@/lib/auth/server-utils"
import type { PelayanAssignmentInput } from "@/lib/types"

export async function GET(req: NextRequest) {
  try {
    const token = getAccessTokenFromRequest(req)
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    const serviceId = req.nextUrl.searchParams.get("serviceId") ?? ""
    const data = await getAssignments(token, serviceId)
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
    const body = await req.json() as PelayanAssignmentInput
    const data = await upsertAssignment(token, body)
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const error = err as { message?: string; status?: number }
    return NextResponse.json({ message: error.message ?? "Failed" }, { status: error.status ?? 500 })
  }
}
