import { NextRequest } from "next/server"

export function getAccessTokenFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get("authorization")
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7)
  }
  return null
}
