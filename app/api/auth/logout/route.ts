import { NextRequest, NextResponse } from "next/server"
import { logout } from "@/lib/api/auth"

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("refresh_token")?.value
    if (token) {
      await logout(token).catch(() => {})
    }
  } finally {
    const res = NextResponse.json({ success: true })
    res.cookies.delete("refresh_token")
    return res
  }
}
