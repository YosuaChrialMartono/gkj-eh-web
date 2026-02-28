"use client"

import { useState, useCallback } from "react"
import { useAuth } from "@/lib/auth/auth-context"

interface UseApiState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (url: string, options?: RequestInit) => Promise<T | null>
}

export function useApi<T = unknown>(): UseApiReturn<T> {
  const { accessToken, refreshAuth } = useAuth()
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  })

  const execute = useCallback(
    async (url: string, options?: RequestInit): Promise<T | null> => {
      setState((s) => ({ ...s, isLoading: true, error: null }))
      try {
        const makeRequest = async (token: string | null) => {
          return fetch(url, {
            ...options,
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
              ...options?.headers,
            },
          })
        }

        let res = await makeRequest(accessToken)

        if (res.status === 401) {
          const refreshed = await refreshAuth()
          if (refreshed) {
            // Re-read the token — refreshAuth updates the context state
            // We re-execute without the old token; the context will have the new one
            res = await makeRequest(accessToken)
          }
        }

        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: res.statusText }))
          throw new Error(err.message ?? res.statusText)
        }

        if (res.status === 204) {
          setState({ data: null, isLoading: false, error: null })
          return null
        }

        const data = await res.json() as T
        setState({ data, isLoading: false, error: null })
        return data
      } catch (err) {
        const message = err instanceof Error ? err.message : "Request failed"
        setState({ data: null, isLoading: false, error: message })
        return null
      }
    },
    [accessToken, refreshAuth]
  )

  return { ...state, execute }
}
