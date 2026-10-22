import { NextResponse } from "next/server"
import { readImage } from "@/lib/server/media"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params
  const media = await readImage(filename)
  if (!media) return new NextResponse("Not found", { status: 404 })
  return new NextResponse(new Uint8Array(media.bytes), {
    headers: {
      "Content-Type": media.type,
      "Content-Length": String(media.bytes.length),
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
