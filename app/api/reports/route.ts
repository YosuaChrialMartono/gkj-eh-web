import { NextRequest } from "next/server"
import { proxyToBackend } from "@/lib/api/proxy"

export async function GET() {
  return proxyToBackend({ method: "GET", path: "/reports" })
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  return proxyToBackend({ method: "POST", path: "/reports", body })
}
