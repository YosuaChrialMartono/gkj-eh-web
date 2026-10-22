import { NextRequest, NextResponse } from "next/server"
import { deleteContent, getContentById, updateContent } from "@/lib/api/content"
import { contentErrorResponse } from "../errors"

type RouteContext = { params: Promise<{ id: string }> }
export async function GET(_req: NextRequest, context: RouteContext) {
  try { return NextResponse.json(await getContentById((await context.params).id)) } catch (error) { return contentErrorResponse(error) }
}
export async function PUT(req: NextRequest, context: RouteContext) {
  try { return NextResponse.json(await updateContent((await context.params).id, await req.json())) } catch (error) { return contentErrorResponse(error) }
}
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try { await deleteContent((await context.params).id); return NextResponse.json({ ok: true }) } catch (error) { return contentErrorResponse(error) }
}
