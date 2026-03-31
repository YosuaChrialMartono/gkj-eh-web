export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { fetchReport } from "@/lib/api/client";
import type { ServiceReport } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID").format(n);
}

function dots(text?: string) {
  return text || "…………………………………………";
}

export default async function PrintPage({ params }: Props) {
  const { id } = await params;
  let report: ServiceReport;
  try {
    report = await fetchReport(id);
  } catch {
    notFound();
  }

  const { pelayananKhusus: pk, persembahan: p, kehadiranJemaat: k } = report;

  return (
    <>
      {/* Print button — hidden in print */}
      <div className="flex justify-center gap-4 bg-zinc-100 p-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700"
        >
          Cetak / Simpan PDF
        </button>
        <a
          href={`/laporan/${id}`}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
        >
          ← Kembali
        </a>
      </div>

      {/* Paper form */}
      <div
        className="mx-auto bg-white p-8 text-zinc-900"
        style={{ width: "210mm", minHeight: "297mm", fontFamily: "serif", fontSize: "11pt" }}
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <p className="text-xs">
            JENIS KEBAKTIAN : {dots(report.jenisKebaktian)}
          </p>
          <div className="mt-2 flex justify-center gap-16 text-xs">
            <span>TANGGAL : {dots(report.tanggal)}</span>
            <span>WAKTU : {dots(report.waktu)} WIB</span>
          </div>
        </div>

        {/* Section 1-3 */}
        <div className="mb-4 space-y-1 text-xs">
          <div>1. PELAYAN FIRMAN : {dots(report.pelayanFirman)}</div>
          <div>2. PERIKOP BACAAN : {dots(report.perikopBacaan)}</div>
          <div>3. TEMA RENUNGAN : {dots(report.temaRenungan)}</div>
        </div>

        {/* Section 4 */}
        <div className="mb-4 text-xs">
          <div className="font-semibold">4. PELAYANAN KHUSUS :</div>
          <div className="ml-4 space-y-0.5">
            <div>4.1 BAPTIS KUDUS ANAK : {pk.baptisKudusAnak || "…………"} ORANG</div>
            <div>4.2 BAPTIS KUDUS DEWASA : {pk.baptisKudusDewasa || "…………"} ORANG</div>
            <div>4.3 MENGAKU PERCAYA (SIDI) : {pk.mengakuPercaya || "…………"} ORANG</div>
            <div>4.4 PEMBERKATAN NIKAH :</div>
            <div className="ml-8">
              4.4.1 SAUDARA : {pk.pemberkatanNikah?.saudara || "……………………………………"}
            </div>
            <div className="ml-20">DENGAN</div>
            <div className="ml-8">
              4.4.2 SAUDARI : {pk.pemberkatanNikah?.saudari || "……………………………………"}
            </div>
          </div>
        </div>

        {/* Section 5 */}
        <div className="mb-4 text-xs">
          <div className="font-semibold">5. PERSEMBAHAN :</div>
          <div className="ml-4 space-y-0.5">
            <div>
              5.1 MELALUI KANTONG<sup>1</sup> : RP {formatRp(p.melaluiKantong.rp)} = {p.melaluiKantong.amplop} AMPLOP
            </div>
            <div>5.2 BULANAN : RP {formatRp(p.bulanan)}</div>
            <div>5.3 SYUKUR : RP {formatRp(p.syukur)}</div>
            <div>5.4 DANA ABADI : RP {formatRp(p.danaAbadi)}</div>
            <div>5.5 KASIH PEDULI : RP {formatRp(p.kasihPeduli)}</div>
            <div>
              5.6 SYUKUR BAPTIS/SIDI/NIKAH : RP {formatRp(p.syukurBaptisSidiNikah.rp)} = {p.syukurBaptisSidiNikah.amplop} AMPLOP
            </div>
            <div>
              5.7 SYUKUR PERJAMUAN KUDUS : RP {formatRp(p.syukurPerjamuan.rp)} = {p.syukurPerjamuan.amplop} AMPLOP
            </div>
            <div>5.8 PERORANGAN : RP {formatRp(p.perorangan)}</div>
            <div>5.9 PEMBANGUNAN : RP {formatRp(p.pembangunan)}</div>
            <div>5.10 KHUSUS : RP {formatRp(p.khusus)}</div>
            <div>5.11 LAIN-LAIN : RP {formatRp(p.lainLain)}</div>
            <div className="mt-1 font-semibold">JUMLAH : RP {formatRp(p.jumlah)}</div>
            <div className="mt-0.5 italic">({p.terbilang || "……………………………………………………………"})</div>
          </div>
        </div>

        {/* Section 6 */}
        <div className="mb-4 text-xs">
          <div className="font-semibold">6. KEHADIRAN JEMAAT :</div>
          <div className="ml-4 space-y-0.5">
            {(
              [
                ["6.1 KEBAKTIAN UMUM", k.umum],
                ["6.2 KEBAKTIAN PEMUDA", k.pemuda],
                ["6.3 KEBAKTIAN REMAJA", k.remaja],
                ["6.4 KEBAKTIAN ANAK", k.anak],
              ] as const
            ).map(([label, val]) => (
              <div key={label}>
                {label} : PRIA: {val.pria} ORANG &nbsp;&nbsp; WANITA: {val.wanita} ORANG
              </div>
            ))}
            <div className="font-semibold">
              TOTAL : PRIA: {k.total.pria} ORANG &nbsp;&nbsp; WANITA: {k.total.wanita} ORANG
            </div>
          </div>
        </div>

        {/* Section 7 */}
        <div className="mb-4 text-xs">
          7. PESERTA PERJAMUAN KUDUS : {report.pesertaPerjamuan || "…………"} ORANG
        </div>

        {/* Section 8 */}
        <div className="mb-4 text-xs">
          <div className="font-semibold">8. ANGGOTA MAJELIS YANG HADIR :</div>
          <div className="ml-4 mt-1 grid grid-cols-2 gap-x-8">
            {Array.from({ length: 33 }, (_, i) => (
              <div key={i} className="flex gap-1">
                <span className="w-8 shrink-0 text-right">{i + 1}.</span>
                <span>{report.anggotaMajelis[i] || "………………………………………"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sections 9-12 */}
        <div className="mb-6 space-y-0.5 text-xs">
          <div>9. PIC IBADAH : {dots(report.picIbadah)}</div>
          <div>10. ORGANIS : {dots(report.organis)}</div>
          <div>
            11. PROKANTOR :
            <div className="ml-16 space-y-0.5">
              {report.prokantor.map((name, i) => (
                <div key={i}>{i + 1}. {dots(name)}</div>
              ))}
            </div>
          </div>
          <div>12. OPERATOR LCD : {dots(report.operatorLcd)}</div>
        </div>

        {/* Signatures */}
        <div className="mb-6 text-xs">
          <div className="mb-4 text-center">
            JAKARTA, {report.tanggalJakarta
              ? new Date(report.tanggalJakarta + "T00:00:00").toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "……………………………………"}
          </div>
          <div className="flex justify-around">
            <div className="text-center">
              <div>MAJELIS GEREJA,</div>
              <div className="mt-12">{report.majelisGereja || "………………………………"}</div>
            </div>
            <div className="text-center">
              <div>PELAYAN FIRMAN,</div>
              <div className="mt-12">{report.pelayanFirman || "………………………………"}</div>
            </div>
          </div>
        </div>

        {/* Evaluation */}
        <div className="border-t border-zinc-400 pt-3 text-xs">
          <div className="font-semibold underline">EVALUASI JALANNYA KEBAKTIAN :</div>
          <div className="mt-2 grid grid-cols-2 gap-8">
            <div>
              <div className="font-medium underline">a. Hal-hal yang sudah berjalan baik:</div>
              <div className="mt-1 min-h-[60px] whitespace-pre-wrap">
                {report.evaluasi.berjalanBaik || ""}
              </div>
            </div>
            <div>
              <div className="font-medium underline">b. Hal-hal yang perlu diperbaiki:</div>
              <div className="mt-1 min-h-[60px] whitespace-pre-wrap">
                {report.evaluasi.perluDiperbaiki || ""}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-between text-xs text-zinc-400">
          <span>1</span>
          <span>
            <sup>1</sup> Persembahan Minggu atau di hari biasa melalui kantong: Jumlah persembahan
            kebaktian umum dan pemuda
          </span>
          <span>KG/form/03/01</span>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { margin: 0; }
          .print\\:hidden { display: none !important; }
          @page { size: A4; margin: 0; }
        }
      `}</style>
    </>
  );
}
