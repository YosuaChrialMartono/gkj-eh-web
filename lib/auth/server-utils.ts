import "server-only"
import { cache } from "react"
import { cookies } from "next/headers"
import { refreshToken as backendRefresh } from "@/lib/api/auth"

/**
 * Server-side: read refresh_token cookie, exchange for an access token via
 * backend `/auth/refresh`. Returns null if no cookie or backend rejects.
 *
 * Wrapped in React.cache so parallel SDK calls inside a single RSC render
 * share one mint instead of hammering /auth/refresh.
 */
export const getAccessToken = cache(async (): Promise<string | null> => {
  const cookieStore = await cookies()
  const rt = cookieStore.get("refresh_token")?.value
  if (!rt) return null
  try {
    const data = await backendRefresh(rt)
    return data.accessToken
  } catch {
    return null
  }
})
