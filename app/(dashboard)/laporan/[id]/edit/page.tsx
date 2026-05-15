export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { fetchReport, fetchMembers } from "@/lib/api/reports-server";
import { ServiceReportForm } from "@/components/forms/service-report/form-tabs";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditLaporanPage({ params }: Props) {
  const { id } = await params;

  let report, members: string[];
  try {
    [report, members] = await Promise.all([fetchReport(id), fetchMembers()]);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Laporan Kebaktian</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {report.jenisKebaktian} —{" "}
          {new Date(report.tanggal + "T00:00:00").toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        <ServiceReportForm report={report} members={members} />
      </div>
    </div>
  );
}
