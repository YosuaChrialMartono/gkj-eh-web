export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchReport } from "@/lib/api/client";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ id: string }>;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-2 border-b border-zinc-100 py-2 last:border-0 dark:border-zinc-800">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-sm">{value || "—"}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">{title}</h2>
      {children}
    </section>
  );
}

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function LaporanDetailPage({ params }: Props) {
  const { id } = await params;
  let report;
  try {
    report = await fetchReport(id);
  } catch {
    notFound();
  }

  const { pelayananKhusus: pk, persembahan: p, kehadiranJemaat: k } = report;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{report.jenisKebaktian}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {new Date(report.tanggal + "T00:00:00").toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            — Pukul {report.waktu} WIB
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href={`/laporan/${id}/print`} target="_blank">
              Cetak
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href={`/laporan/${id}/edit`}>Edit</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Service details */}
        <Section title="Pelayanan Firman">
          <DetailRow label="Pelayan Firman" value={report.pelayanFirman} />
          <DetailRow label="Perikop Bacaan" value={report.perikopBacaan} />
          <DetailRow label="Tema Renungan" value={report.temaRenungan} />
        </Section>

        {/* Special services */}
        <Section title="Pelayanan Khusus">
          <DetailRow label="Baptis Kudus Anak" value={`${pk.baptisKudusAnak} orang`} />
          <DetailRow label="Baptis Kudus Dewasa" value={`${pk.baptisKudusDewasa} orang`} />
          <DetailRow label="Mengaku Percaya (Sidi)" value={`${pk.mengakuPercaya} orang`} />
          {pk.pemberkatanNikah && (
            <DetailRow
              label="Pemberkatan Nikah"
              value={`${pk.pemberkatanNikah.saudara} & ${pk.pemberkatanNikah.saudari}`}
            />
          )}
        </Section>

        {/* Attendance */}
        <Section title="Kehadiran Jemaat">
          {(
            [
              ["Kebaktian Umum", k.umum],
              ["Kebaktian Pemuda", k.pemuda],
              ["Kebaktian Remaja", k.remaja],
              ["Kebaktian Anak", k.anak],
            ] as const
          ).map(([label, val]) => (
            <DetailRow
              key={label}
              label={label}
              value={`Pria: ${val.pria} | Wanita: ${val.wanita} | Total: ${val.pria + val.wanita}`}
            />
          ))}
          <DetailRow
            label="Total"
            value={
              <strong>
                Pria: {k.total.pria} | Wanita: {k.total.wanita} | Total:{" "}
                {k.total.pria + k.total.wanita}
              </strong>
            }
          />
          <DetailRow label="Peserta Perjamuan Kudus" value={`${report.pesertaPerjamuan} orang`} />
        </Section>

        {/* Offerings */}
        <Section title="Persembahan">
          {(
            [
              ["Melalui Kantong", `${formatRp(p.melaluiKantong.rp)} (${p.melaluiKantong.amplop} amplop)`],
              ["Bulanan", formatRp(p.bulanan)],
              ["Syukur", formatRp(p.syukur)],
              ["Dana Abadi", formatRp(p.danaAbadi)],
              ["Kasih Peduli", formatRp(p.kasihPeduli)],
              ["Syukur Baptis/Sidi/Nikah", `${formatRp(p.syukurBaptisSidiNikah.rp)} (${p.syukurBaptisSidiNikah.amplop} amplop)`],
              ["Syukur Perjamuan", `${formatRp(p.syukurPerjamuan.rp)} (${p.syukurPerjamuan.amplop} amplop)`],
              ["Perorangan", formatRp(p.perorangan)],
              ["Pembangunan", formatRp(p.pembangunan)],
              ["Khusus", formatRp(p.khusus)],
              ["Lain-lain", formatRp(p.lainLain)],
            ] as [string, string][]
          ).map(([label, val]) => (
            <DetailRow key={label} label={label} value={val} />
          ))}
          <DetailRow label="Jumlah" value={<strong>{formatRp(p.jumlah)}</strong>} />
          <DetailRow label="Terbilang" value={<em>{p.terbilang}</em>} />
        </Section>

        {/* Personnel */}
        <Section title="Petugas Ibadah">
          <DetailRow label="PIC Ibadah" value={report.picIbadah} />
          <DetailRow label="Organis" value={report.organis} />
          <DetailRow
            label="Prokantor"
            value={report.prokantor.filter(Boolean).join(", ") || "—"}
          />
          <DetailRow label="Operator LCD" value={report.operatorLcd} />
        </Section>

        {/* Council members */}
        <Section title="Anggota Majelis yang Hadir">
          <div className="grid grid-cols-2 gap-1 text-sm">
            {report.anggotaMajelis
              .filter(Boolean)
              .map((name, i) => (
                <span key={i}>
                  {i + 1}. {name}
                </span>
              ))}
            {report.anggotaMajelis.filter(Boolean).length === 0 && (
              <span className="col-span-2 text-zinc-500">—</span>
            )}
          </div>
        </Section>

        {/* Evaluation */}
        <Section title="Evaluasi Jalannya Kebaktian">
          <div className="space-y-3">
            <div>
              <p className="mb-1 text-xs font-medium text-zinc-500">a. Hal-hal yang sudah berjalan baik</p>
              <p className="text-sm">{report.evaluasi.berjalanBaik || "—"}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-zinc-500">b. Hal-hal yang perlu diperbaiki</p>
              <p className="text-sm">{report.evaluasi.perluDiperbaiki || "—"}</p>
            </div>
          </div>
        </Section>
      </div>

      <div className="flex justify-start">
        <Button asChild variant="ghost" size="sm">
          <Link href="/laporan">← Kembali ke Daftar</Link>
        </Button>
      </div>
    </div>
  );
}
