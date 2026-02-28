import { NextRequest, NextResponse } from "next/server"
import { logout } from "@/lib/api/auth"
import { getAccessTokenFromRequest } from "@/lib/auth/server-utils"

export async function POST(req: NextRequest) {
  try {
    const token = getAccessTokenFromRequest(req)
    if (token) {
      await logout(token).catch(() => {})
    }
  } finally {
    const res = NextResponse.json({ success: true })
    res.cookies.delete("refresh_token")
    return res
  }
}
