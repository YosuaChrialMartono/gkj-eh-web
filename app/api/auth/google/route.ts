import { NextRequest, NextResponse } from "next/server"
import { googleAuth } from "@/lib/api/auth"

export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json() as { credential?: string }
    if (!credential) {
      return NextResponse.json({ message: "Missing credential" }, { status: 400 })
    }
    const data = await googleAuth({ credential })
    if (!data.refreshToken) {
      return NextResponse.json(
        { message: "Auth response missing refreshToken" },
        { status: 502 },
      )
    }
    const res = NextResponse.json({ user: data.user, accessToken: data.accessToken })
    res.cookies.set("refresh_token", data.refreshToken, {
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
      { message: error.message ?? "Google login failed" },
      { status: error.status ?? 500 },
    )
  }
}
