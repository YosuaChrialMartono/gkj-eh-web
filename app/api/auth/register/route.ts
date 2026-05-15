import { NextRequest, NextResponse } from "next/server"
import { register } from "@/lib/api/auth"
import type { RegisterInput } from "@/lib/types"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as RegisterInput
    const data = await register(body)
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
      { message: error.message ?? "Registration failed" },
      { status: error.status ?? 500 }
    )
  }
}
