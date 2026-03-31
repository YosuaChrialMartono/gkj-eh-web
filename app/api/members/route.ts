import { NextResponse } from "next/server";
import { getMembers } from "@/lib/api/mock-store";

export async function GET() {
  return NextResponse.json(getMembers());
}
