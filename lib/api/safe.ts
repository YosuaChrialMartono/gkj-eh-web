/**
 * Resolve a data fetch to a fallback when it fails, but log the real error
 * first so failures are visible (server console / logs) instead of silently
 * looking like "no data". Use for resilient RSC fetches that should degrade
 * to an empty state rather than crash the page.
 */
export function withFallback<T>(
  promise: Promise<T>,
  fallback: T,
  context: string,
): Promise<T> {
  return promise.catch((error: unknown) => {
    console.error(`[data] ${context} failed:`, error)
    return fallback
  })
}
