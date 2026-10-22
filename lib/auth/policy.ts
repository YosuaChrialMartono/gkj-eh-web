import { AppError } from "@/lib/actions/result"
export type Role = "viewer" | "editor" | "admin"
export type Capability = "dashboard:read" | "content:write" | "reports:write" | "pelayan:write" | "media:write" | "roles:manage" | "users:manage"
export function can(role: Role, capability: Capability): boolean {
  if (capability === "dashboard:read") return true
  if (capability === "roles:manage" || capability === "users:manage") return role === "admin"
  return role === "admin" || role === "editor"
}
export function assertCapability(role: Role, capability: Capability) {
  if (!can(role, capability)) throw new AppError("FORBIDDEN", "Permission denied")
}
export function safeRedirect(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\x00-\x20]/.test(value)) return "/dashboard"
  return value
}
