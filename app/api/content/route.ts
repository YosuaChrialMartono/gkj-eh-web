import { NextRequest } from "next/server"
import { proxyToBackend } from "@/lib/api/proxy"

export async function GET(req: NextRequest) {
  return proxyToBackend({
    method: "GET",
    path: "/content",
    searchParams: req.nextUrl.searchParams,
  })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  return proxyToBackend({
    method: "POST",
    path: "/content",
    body,
  })
}
