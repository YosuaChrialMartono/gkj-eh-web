import { describe, it, expect, vi } from "vitest"
import { can, assertCapability, safeRedirect, type Role } from "@/lib/auth/policy"
import { AppError } from "@/lib/actions/result"
import { actionResult } from "@/lib/server/action"
import { registrationSchema } from "@/lib/server/auth/users"
import { z } from "zod"
import { defaultFormValues } from "@/lib/form-defaults"
import { parseReportReplacement } from "@/lib/server/report-contract"

describe("authorization contract", () => {
  for (const role of ["viewer", "editor", "admin"] as Role[]) {
    it(`${role} matrix`, () => {
      expect(can(role, "dashboard:read")).toBe(true)
      for (const capability of ["content:write", "reports:write", "pelayan:write", "media:write"] as const) expect(can(role, capability)).toBe(role !== "viewer")
      expect(can(role, "roles:manage")).toBe(role === "admin")
      expect(can(role, "users:manage")).toBe(role === "admin")
    })
  }
  it("denies viewers at service boundary", () => expect(() => assertCapability("viewer", "reports:write")).toThrow(AppError))
  it("accepts only local redirects", () => {
    for (const path of ["https://evil.test", "//evil.test", "/\\evil.test", "/\nevil.test", null]) expect(safeRedirect(path)).toBe("/dashboard")
    expect(safeRedirect("/laporan?month=10")).toBe("/laporan?month=10")
  })
})
describe("action contract", () => {
  it("returns data", async () => expect(await actionResult(async () => 42)).toEqual({ ok: true, data: 42 }))
  it("returns typed denials", async () => expect(await actionResult(async () => { throw new AppError("FORBIDDEN", "Permission denied") })).toMatchObject({ ok: false, error: { code: "FORBIDDEN" } }))
  it("returns field errors", async () => expect(await actionResult(async () => z.object({ name: z.string() }).parse({}))).toMatchObject({ ok: false, error: { code: "VALIDATION", fields: { name: expect.any(Array) } } }))
  it("does not leak SQL/private errors", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(await actionResult(async () => { throw new Error("password=secret") })).toEqual({ ok: false, error: { code: "INTERNAL", message: "Operation failed" } })
    log.mockRestore()
  })
  it("normalizes registration and refuses role injection", () => {
    expect(registrationSchema.parse({ name: " Test ", email: " TEST@EXAMPLE.COM ", password: "long-password-123" }).email).toBe("test@example.com")
    expect(registrationSchema.safeParse({ name: "Test", email: "t@example.com", password: "long-password-123", role: "admin" }).success).toBe(false)
  })
  it("validates report dates/time and strips forged metadata with full replacement", () => {
    const input = { ...defaultFormValues(), tanggal: "2026-10-25", jenisKebaktian: "Minggu", pelayanFirman: "Test", perikopBacaan: "Test", temaRenungan: "Test", id: "forged", updatedAt: "forged" }
    const parsed = parseReportReplacement(input)
    expect(parsed.data).not.toHaveProperty("id")
    expect(parsed.data).not.toHaveProperty("updatedAt")
    expect(parsed.data).not.toHaveProperty("tanggal")
    expect(() => parseReportReplacement({ ...input, tanggal: "2026-02-30" })).toThrow()
    expect(() => parseReportReplacement({ ...input, waktu: "24:61" })).toThrow()
    expect(() => parseReportReplacement({ tanggal: input.tanggal })).toThrow()
  })
})
