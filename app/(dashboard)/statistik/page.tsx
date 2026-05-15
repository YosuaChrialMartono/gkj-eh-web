export const dynamic = "force-dynamic";

import { fetchReports } from "@/lib/api/reports-server";
import { AttendanceChart } from "@/components/statistik/attendance-chart";
import { OfferingChart } from "@/components/statistik/offering-chart";
import type { ServiceReport } from "@/types";

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-zinc-400">{sub}</p>}
    </div>
  );
}

export default async function StatistikPage() {
  let reports: ServiceReport[] = [];
  try {
    reports = await fetchReports();
  } catch {
    // handled below
  }

  // Sort oldest-first for chart readability
  const sorted = [...reports].sort(
    (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime(),
  );

  const totalJemaat = reports.reduce(
    (sum, r) => sum + r.kehadiranJemaat.total.pria + r.kehadiranJemaat.total.wanita,
    0,
  );
  const totalPersembahan = reports.reduce((sum, r) => sum + r.persembahan.jumlah, 0);
  const totalBaptis = reports.reduce(
    (sum, r) => sum + r.pelayananKhusus.baptisKudusAnak + r.pelayananKhusus.baptisKudusDewasa,
    0,
  );
  const totalSidi = reports.reduce(
    (sum, r) => sum + r.pelayananKhusus.mengakuPercaya,
    0,
  );
  const totalNikah = reports.filter((r) => r.pelayananKhusus.pemberkatanNikah !== null).length;
  const avgJemaat = reports.length > 0 ? Math.round(totalJemaat / reports.length) : 0;

  const formatRp = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Statistik Kebaktian</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Berdasarkan {reports.length} laporan kebaktian
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <p className="text-zinc-500">Belum ada data laporan untuk ditampilkan.</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Rata-rata Kehadiran"
              value={`${avgJemaat} orang`}
              sub="per kebaktian"
            />
            <StatCard
              label="Total Persembahan"
              value={formatRp(totalPersembahan)}
              sub={`dari ${reports.length} laporan`}
            />
            <StatCard
              label="Baptis"
              value={`${totalBaptis} orang`}
              sub={`Anak + Dewasa`}
            />
            <StatCard
              label="Sidi / Nikah"
              value={`${totalSidi} / ${totalNikah}`}
              sub="mengaku percaya / pemberkatan"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
              <h2 className="mb-4 text-sm font-semibold">Kehadiran per Kebaktian</h2>
              <AttendanceChart reports={sorted} />
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
              <h2 className="mb-4 text-sm font-semibold">Total Persembahan</h2>
              <OfferingChart reports={sorted} />
            </div>
          </div>

          {/* Recent reports table */}
          <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
            <div className="border-b border-zinc-200 px-5 py-3 dark:border-zinc-700">
              <h2 className="text-sm font-semibold">Ringkasan per Laporan</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500">Tanggal</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500">Jenis</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-zinc-500">Umum</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-zinc-500">Pemuda</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-zinc-500">Remaja</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-zinc-500">Anak</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-zinc-500">Total</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-zinc-500">Persembahan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                  {sorted.map((r) => {
                    const total =
                      r.kehadiranJemaat.total.pria + r.kehadiranJemaat.total.wanita;
                    return (
                      <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <td className="px-4 py-2 text-xs">
                          {new Date(r.tanggal + "T00:00:00").toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-2 text-xs text-zinc-500">{r.jenisKebaktian}</td>
                        <td className="px-4 py-2 text-right text-xs tabular-nums">
                          {r.kehadiranJemaat.umum.pria + r.kehadiranJemaat.umum.wanita}
                        </td>
                        <td className="px-4 py-2 text-right text-xs tabular-nums">
                          {r.kehadiranJemaat.pemuda.pria + r.kehadiranJemaat.pemuda.wanita}
                        </td>
                        <td className="px-4 py-2 text-right text-xs tabular-nums">
                          {r.kehadiranJemaat.remaja.pria + r.kehadiranJemaat.remaja.wanita}
                        </td>
                        <td className="px-4 py-2 text-right text-xs tabular-nums">
                          {r.kehadiranJemaat.anak.pria + r.kehadiranJemaat.anak.wanita}
                        </td>
                        <td className="px-4 py-2 text-right text-xs font-medium tabular-nums">{total}</td>
                        <td className="px-4 py-2 text-right text-xs tabular-nums">
                          {formatRp(r.persembahan.jumlah)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
