export * from "./content"
export * from "./auth"
export * from "./pelayan"

export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}
