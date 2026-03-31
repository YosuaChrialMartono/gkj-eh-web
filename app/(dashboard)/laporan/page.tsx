export const dynamic = "force-dynamic";

import Link from "next/link";
import { fetchReports } from "@/lib/api/reports";
import { Button } from "@/components/ui/button";
import type { ServiceReport } from "@/types";

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default async function LaporanPage() {
  let reports: ServiceReport[] = [];
  try {
    reports = await fetchReports();
  } catch {
    // handled below
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Laporan Kebaktian</h1>
          <p className="mt-1 text-sm text-zinc-500">KG/form/03/01 — Laporan Mingguan</p>
        </div>
        <Button asChild>
          <Link href="/laporan/new">+ Laporan Baru</Link>
        </Button>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <p className="text-zinc-500">Belum ada laporan. Buat laporan baru untuk memulai.</p>
          <Button asChild className="mt-4">
            <Link href="/laporan/new">Buat Laporan Pertama</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-300">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-300">
                  Jenis Kebaktian
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-300">
                  Pelayan Firman
                </th>
                <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-300">
                  Total Jemaat
                </th>
                <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-300">
                  Total Persembahan
                </th>
                <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-300">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-700 dark:bg-zinc-900">
              {reports.map((r) => {
                const totalJemaat =
                  r.kehadiranJemaat.total.pria + r.kehadiranJemaat.total.wanita;
                return (
                  <tr
                    key={r.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <td className="px-4 py-3 font-medium">
                      {new Date(r.tanggal + "T00:00:00").toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                      {r.jenisKebaktian}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                      {r.pelayanFirman}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{totalJemaat} orang</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatRp(r.persembahan.jumlah)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/laporan/${r.id}`}
                          className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
                        >
                          Lihat
                        </Link>
                        <Link
                          href={`/laporan/${r.id}/edit`}
                          className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/laporan/${r.id}/print`}
                          className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
                        >
                          Cetak
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
