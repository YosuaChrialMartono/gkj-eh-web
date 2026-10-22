import { describe, expect, it } from "vitest"
import { z } from "zod"
import { AppError } from "@/lib/actions/result"
import { contentErrorResponse } from "@/app/api/content/errors"

describe("content API error mapping", () => {
  it("returns 400 for Zod validation failures and preserves structured field errors", async () => {
    const parsed = z.object({ title: z.string().min(1) }).safeParse({ title: "" })
    expect(parsed.success).toBe(false)
    const response = contentErrorResponse(parsed.success ? new Error() : parsed.error)
    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({ code: "VALIDATION", fields: { title: expect.any(Array) } })
  })

  it("maps application conflicts to HTTP 409", () => {
    expect(contentErrorResponse(new AppError("CONFLICT", "Slug taken")).status).toBe(409)
  })
})
