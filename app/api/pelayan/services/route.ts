import { NextRequest, NextResponse } from "next/server"
import { getServices, createService } from "@/lib/api/pelayan"
import type { PelayanServiceInput } from "@/lib/types"

export async function GET(req: NextRequest) {
  try {
    const month = req.nextUrl.searchParams.get("month") ?? ""
    const data = await getServices(month)
    return NextResponse.json(data)
  } catch (err) {
    const error = err as { message?: string; status?: number }
    return NextResponse.json({ message: error.message ?? "Failed" }, { status: error.status ?? 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as PelayanServiceInput
    const data = await createService(body)
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const error = err as { message?: string; status?: number }
    return NextResponse.json({ message: error.message ?? "Failed" }, { status: error.status ?? 500 })
  }
}
