import { NextResponse } from "next/server"
import { getAccessToken } from "@/lib/auth/server-utils"

const BASE = process.env.API_URL

interface ProxyOptions {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  path: string
  body?: string
  searchParams?: URLSearchParams
}

export async function proxyToBackend({
  method,
  path,
  body,
  searchParams,
}: ProxyOptions): Promise<NextResponse> {
  if (!BASE) {
    return NextResponse.json(
      { message: "API_URL not configured" },
      { status: 500 }
    )
  }

  const token = await getAccessToken()
  if (!token) {
    return NextResponse.json(
      { message: "Not authenticated" },
      { status: 401 }
    )
  }

  const url = new URL(path, BASE.endsWith("/") ? BASE : BASE + "/")
  if (searchParams) {
    searchParams.forEach((v, k) => url.searchParams.set(k, v))
  }

  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream fetch failed"
    return NextResponse.json({ message }, { status: 502 })
  }

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 })
  }

  const text = await res.text()
  if (!text) return new NextResponse(null, { status: res.status })
  try {
    return NextResponse.json(JSON.parse(text), { status: res.status })
  } catch {
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") ?? "text/plain" },
    })
  }
}
