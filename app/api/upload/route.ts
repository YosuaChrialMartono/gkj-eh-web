import { NextRequest, NextResponse } from "next/server"
import { getAccessToken } from "@/lib/auth/server-utils"

const BASE = process.env.API_URL

export async function POST(req: NextRequest) {
  if (!BASE) {
    return NextResponse.json({ message: "API_URL not configured" }, { status: 500 })
  }

  const token = await getAccessToken()
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
  }

  const formData = await req.formData()
  const url = new URL("/uploads", BASE.endsWith("/") ? BASE : BASE + "/")

  let res: Response
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream fetch failed"
    return NextResponse.json({ message }, { status: 502 })
  }

  const text = await res.text()
  if (!res.ok) {
    try {
      return NextResponse.json(JSON.parse(text), { status: res.status })
    } catch {
      return new NextResponse(text, { status: res.status })
    }
  }

  const data = JSON.parse(text) as { url: string; filename: string }
  const apiBase = BASE.replace(/\/$/, "")
  return NextResponse.json({
    url: `${apiBase}${data.url}`,
    filename: data.filename,
  })
}
