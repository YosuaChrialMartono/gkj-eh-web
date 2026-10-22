import { getCurrentUser } from "@/lib/server/auth"
export async function GET() {
  const user = await getCurrentUser()
  return Response.json(user, { status: user ? 200 : 401, headers: { "Cache-Control": "no-store" } })
}
