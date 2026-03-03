import { NextRequest, NextResponse } from "next/server"
import { getPersons, createPerson } from "@/lib/api/pelayan"

export async function GET() {
  try {
    const data = await getPersons()
    return NextResponse.json(data)
  } catch (err) {
    const error = err as { message?: string; status?: number }
    return NextResponse.json({ message: error.message ?? "Failed" }, { status: error.status ?? 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json() as { name: string }
    const data = await createPerson(name)
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const error = err as { message?: string; status?: number }
    return NextResponse.json({ message: error.message ?? "Failed" }, { status: error.status ?? 500 })
  }
}
