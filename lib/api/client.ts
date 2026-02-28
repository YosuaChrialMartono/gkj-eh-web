import type { ApiError } from "@/lib/types"

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const base = process.env.API_URL
  if (!base) throw new Error("API_URL environment variable is not set")
  const url = new URL(path, base.endsWith("/") ? base : base + "/")
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url.toString()
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    const body = await res.json()
    return { message: body.message ?? res.statusText, status: res.status, errors: body.errors }
  } catch {
    return { message: res.statusText, status: res.status }
  }
}

export async function apiClient<T>(path: string, options?: RequestOptions): Promise<T> {
  const { params, ...fetchOptions } = options ?? {}
  const url = buildUrl(path, params)
  const res = await fetch(url, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  })
  if (res.status === 204) return undefined as T
  if (!res.ok) throw await parseError(res)
  return res.json() as Promise<T>
}

export async function authenticatedApiClient<T>(
  token: string,
  path: string,
  options?: RequestOptions
): Promise<T> {
  const { params, ...fetchOptions } = options ?? {}
  return apiClient<T>(path, {
    ...fetchOptions,
    params,
    headers: {
      Authorization: `Bearer ${token}`,
      ...fetchOptions.headers,
    },
  })
}
