import { NextRequest } from "next/server"
import { proxyToBackend } from "@/lib/api/proxy"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  return proxyToBackend({ method: "GET", path: `/reports/${id}` })
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await request.text()
  return proxyToBackend({ method: "PUT", path: `/reports/${id}`, body })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  return proxyToBackend({ method: "DELETE", path: `/reports/${id}` })
}
