import { NextRequest, NextResponse } from "next/server";
import { getReportById, updateReport, deleteReport } from "@/lib/api/mock-store";
import { serviceReportSchema } from "@/lib/schemas/service-report";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const report = getReportById(id);
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }
  return NextResponse.json(report);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = serviceReportSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const updated = updateReport(id, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ok = deleteReport(id);
  if (!ok) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
