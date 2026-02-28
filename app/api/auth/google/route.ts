import { NextRequest, NextResponse } from "next/server"
import { googleAuth } from "@/lib/api/auth"
import type { GoogleAuthInput } from "@/lib/types"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as GoogleAuthInput
    const data = await googleAuth(body)
    const res = NextResponse.json({ user: data.user, accessToken: data.accessToken })
    res.cookies.set("refresh_token", data.accessToken, {
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
      { message: error.message ?? "Google auth failed" },
      { status: error.status ?? 500 }
    )
  }
}
