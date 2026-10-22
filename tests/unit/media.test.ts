import { afterEach, describe, expect, it } from "vitest"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { MAX_MEDIA_BYTES, persistImage, readImage } from "@/lib/server/media"

const oldDirectory = process.env.MEDIA_STORAGE_DIR
let directory: string | undefined
afterEach(async () => {
  if (directory) await rm(directory, { recursive: true, force: true })
  directory = undefined
  if (oldDirectory === undefined) delete process.env.MEDIA_STORAGE_DIR
  else process.env.MEDIA_STORAGE_DIR = oldDirectory
})

describe("local media storage", () => {
  it("persists a signature-checked image and serves it under an immutable same-origin URL", async () => {
    directory = await mkdtemp(join(tmpdir(), "gkj-media-"))
    process.env.MEDIA_STORAGE_DIR = directory
    const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0])
    const result = await persistImage(new File([new Uint8Array(png)], "image.png", { type: "image/png" }))
    expect(result.url).toBe(`/api/media/${result.filename}`)
    const stored = await readImage(result.filename)
    expect(stored?.type).toBe("image/png")
    expect(stored?.bytes).toEqual(png)
  })

  it("rejects mismatched signatures, unsupported types, oversized images, and traversal names", async () => {
    directory = await mkdtemp(join(tmpdir(), "gkj-media-"))
    process.env.MEDIA_STORAGE_DIR = directory
    await expect(persistImage(new File(["not a png"], "x.png", { type: "image/png" }))).rejects.toThrow("does not match")
    await expect(persistImage(new File(["x"], "x.svg", { type: "image/svg+xml" }))).rejects.toThrow("Unsupported")
    await expect(persistImage(new File([new Uint8Array(MAX_MEDIA_BYTES + 1)], "large.png", { type: "image/png" }))).rejects.toThrow("5 MB")
    await expect(readImage("../secret.png")).resolves.toBeNull()
  })
})
