import { NextRequest, NextResponse } from "next/server"

const PROTECTED_PATHS = ["/dashboard", "/title-converter", "/content"]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hasRefreshToken = req.cookies.has("refresh_token")

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  if (isProtected && !hasRefreshToken) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname === "/login" && hasRefreshToken) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/title-converter/:path*", "/content/:path*", "/login"],
}
