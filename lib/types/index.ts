export * from "./content"
export * from "./pelayan"

export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}
