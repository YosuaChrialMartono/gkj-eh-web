import { NextRequest } from "next/server"
import { proxyToBackend } from "@/lib/api/proxy"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params
  return proxyToBackend({ method: "GET", path: `/content/${id}` })
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params
  const body = await req.text()
  return proxyToBackend({ method: "PUT", path: `/content/${id}`, body })
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params
  return proxyToBackend({ method: "DELETE", path: `/content/${id}` })
}
