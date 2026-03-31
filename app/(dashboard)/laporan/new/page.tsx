export const dynamic = "force-dynamic";

import { fetchMembers } from "@/lib/api/reports";
import { ServiceReportForm } from "@/components/forms/service-report/form-tabs";

export default async function NewLaporanPage() {
  let members: string[] = [];
  try {
    members = await fetchMembers();
  } catch {
    // graceful fallback — form still works with empty autocomplete
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Laporan Kebaktian Baru</h1>
        <p className="mt-1 text-sm text-zinc-500">KG/form/03/01</p>
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        <ServiceReportForm members={members} />
      </div>
    </div>
  );
}
