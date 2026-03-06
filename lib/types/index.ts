export * from "./content"
export * from "./pelayan"
export * from "./auth"

export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}
