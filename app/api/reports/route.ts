import { NextRequest, NextResponse } from "next/server";
import { getAllReports, createReport } from "@/lib/api/mock-store";
import { serviceReportSchema } from "@/lib/schemas/service-report";

export async function GET() {
  const reports = getAllReports();
  return NextResponse.json(reports);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = serviceReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const report = createReport(parsed.data);
    return NextResponse.json(report, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
