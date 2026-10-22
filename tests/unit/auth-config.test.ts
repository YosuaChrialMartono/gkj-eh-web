import { afterEach, expect, it, vi } from "vitest"
import NextAuth, { type NextAuthConfig } from "next-auth"
vi.mock("next-auth", () => ({ default: vi.fn(() => ({})) }))
vi.mock("@/lib/server/db", () => ({ getDb: vi.fn() }))
vi.mock("@auth/drizzle-adapter", () => ({ DrizzleAdapter: vi.fn() }))
afterEach(() => { vi.unstubAllEnvs() })
it("requires verified Google email and explicitly forbids email-based linking", async () => {
  vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost/gkj_test")
  vi.stubEnv("AUTH_SECRET", "test-secret-at-least-32-characters-long")
  vi.stubEnv("AUTH_GOOGLE_ID", "test-google-id")
  vi.stubEnv("AUTH_GOOGLE_SECRET", "test-google-secret")
  await import("@/auth")
  const init = vi.mocked(NextAuth).mock.calls[0][0] as () => NextAuthConfig
  const config = init()
  const google = config.providers.find(p => typeof p !== "function" && p.id === "google")
  expect(google).toMatchObject({ options: { allowDangerousEmailAccountLinking: false } })
  const signIn = config.callbacks!.signIn!
  const account = { provider: "google", type: "oidc" as const, providerAccountId: "id" }
  const user = { id: "id" }
  expect(await signIn({ account, user, profile: { email_verified: false } })).toBe(false)
  expect(await signIn({ account, user, profile: { email_verified: true } })).toBe(true)
})
