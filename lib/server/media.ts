import "server-only"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join, resolve } from "node:path"
import { randomUUID } from "node:crypto"

export const MAX_MEDIA_BYTES = 5 * 1024 * 1024
const mediaTypes = {
  "image/jpeg": { extension: "jpg", signature: (b: Buffer) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/png": { extension: "png", signature: (b: Buffer) => b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
  "image/webp": { extension: "webp", signature: (b: Buffer) => b.length >= 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" },
  "image/gif": { extension: "gif", signature: (b: Buffer) => b.length >= 6 && ["GIF87a", "GIF89a"].includes(b.toString("ascii", 0, 6)) },
} as const
export type MediaType = keyof typeof mediaTypes

function storageDirectory() {
  const configured = process.env.UPLOAD_DIR
  if (configured && !configured.startsWith("/")) throw new Error("UPLOAD_DIR must be an absolute path")
  // Node runtime must mount this path on persistent writable storage; container-local files are not durable.
  return resolve(configured || "/var/lib/gkj/media")
}

export async function persistImage(file: File) {
  if (!file.size || file.size > MAX_MEDIA_BYTES) throw new Error("Image must be between 1 byte and 5 MB")
  const type = file.type as MediaType
  const details = mediaTypes[type]
  if (!details) throw new Error("Unsupported image type")
  const bytes = Buffer.from(await file.arrayBuffer())
  if (bytes.length !== file.size || !details.signature(bytes)) throw new Error("Image content does not match its media type")
  const filename = `${randomUUID()}.${details.extension}`
  const directory = storageDirectory()
  await mkdir(directory, { recursive: true, mode: 0o750 })
  await writeFile(join(directory, filename), bytes, { flag: "wx", mode: 0o640 })
  return { filename, url: `/api/media/${filename}` }
}

export async function readImage(filename: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|gif)$/.test(filename)) return null
  const type = Object.entries(mediaTypes).find(([, details]) => details.extension === filename.split(".").pop())?.[0] as MediaType | undefined
  if (!type) return null
  try { return { bytes: await readFile(join(storageDirectory(), filename)), type } } catch { return null }
}
