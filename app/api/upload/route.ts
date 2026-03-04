import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ message: "Invalid file type" }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: "File too large (max 5MB)" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.split(".").pop() ?? "jpg"
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`
    const uploadDir = path.join(process.cwd(), "public", "uploads")

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const filePath = path.join(uploadDir, uniqueName)
    await writeFile(filePath, buffer)

    const url = `/uploads/${uniqueName}`

    return NextResponse.json({ url }, { status: 201 })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ message: "Upload failed" }, { status: 500 })
  }
}
