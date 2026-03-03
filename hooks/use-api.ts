"use client"

import { useState, useCallback } from "react"

interface UseApiState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (url: string, options?: RequestInit) => Promise<T | null>
}

export function useApi<T = unknown>(): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  })

  const execute = useCallback(
    async (url: string, options?: RequestInit): Promise<T | null> => {
      setState((s) => ({ ...s, isLoading: true, error: null }))
      try {
        const res = await fetch(url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...options?.headers,
          },
        })

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
    []
  )

  return { ...state, execute }
}
