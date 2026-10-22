import { NextRequest, NextResponse } from "next/server"
import { AppError } from "@/lib/actions/result"
import { requireCapability } from "@/lib/server/auth"
import { persistImage } from "@/lib/server/media"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const contentLength = Number(req.headers.get("content-length") || 0)
    if (contentLength > 6 * 1024 * 1024) return NextResponse.json({ message: "Upload exceeds 5 MB" }, { status: 413 })
    await requireCapability("media:write")
    const form = await req.formData()
    const file = form.get("file")
    if (!(file instanceof File)) return NextResponse.json({ message: "Image file is required" }, { status: 400 })
    const saved = await persistImage(file)
    return NextResponse.json(saved, { status: 201 })
  } catch (error) {
    if (error instanceof AppError && error.code === "UNAUTHENTICATED") return NextResponse.json({ message: error.message }, { status: 401 })
    if (error instanceof AppError && error.code === "FORBIDDEN") return NextResponse.json({ message: error.message }, { status: 403 })
    if (error instanceof Error && ["Unsupported image type", "Image content does not match its media type", "Image must be between 1 byte and 5 MB"].includes(error.message)) return NextResponse.json({ message: error.message }, { status: 400 })
    console.error("Image upload failed", error)
    return NextResponse.json({ message: "Upload failed" }, { status: 500 })
  }
}
