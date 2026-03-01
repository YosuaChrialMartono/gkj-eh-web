import { NextRequest, NextResponse } from "next/server"
import { refreshToken } from "@/lib/api/auth"

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("refresh_token")?.value
    if (!token) {
      return NextResponse.json({ message: "No refresh token" }, { status: 401 })
    }
    const data = await refreshToken(token)
    const res = NextResponse.json({ user: data.user, accessToken: data.accessToken })
    res.cookies.set("refresh_token", data.refreshToken ?? data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    })
    return res
  } catch (err) {
    const error = err as { message?: string; status?: number }
    return NextResponse.json(
      { message: error.message ?? "Token refresh failed" },
      { status: error.status ?? 401 }
    )
  }
}
