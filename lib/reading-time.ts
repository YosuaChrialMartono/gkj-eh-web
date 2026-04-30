const WORDS_PER_MINUTE = 200

export function readingTime(input: string | null | undefined): number {
  if (!input) return 1
  const text = input.replace(/<[^>]+>/g, " ")
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}
