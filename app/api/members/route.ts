import { proxyToBackend } from "@/lib/api/proxy"

export async function GET() {
  return proxyToBackend({ method: "GET", path: "/members" })
}
