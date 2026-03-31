import type { ServiceReportFormValues } from "@/lib/schemas/service-report";

/** Returns a blank form with sensible zero/empty defaults */
export function defaultFormValues(): ServiceReportFormValues {
  return {
    jenisKebaktian: "",
    tanggal: new Date().toISOString().slice(0, 10),
    waktu: "08:00",
    pelayanFirman: "",
    perikopBacaan: "",
    temaRenungan: "",
    pelayananKhusus: {
      baptisKudusAnak: 0,
      baptisKudusDewasa: 0,
      mengakuPercaya: 0,
      pemberkatanNikah: null,
    },
    persembahan: {
      melaluiKantong: { rp: 0, amplop: 0 },
      bulanan: 0,
      syukur: 0,
      danaAbadi: 0,
      kasihPeduli: 0,
      syukurBaptisSidiNikah: { rp: 0, amplop: 0 },
      syukurPerjamuan: { rp: 0, amplop: 0 },
      perorangan: 0,
      pembangunan: 0,
      khusus: 0,
      lainLain: 0,
      jumlah: 0,
      terbilang: "",
    },
    kehadiranJemaat: {
      umum: { pria: 0, wanita: 0 },
      pemuda: { pria: 0, wanita: 0 },
      remaja: { pria: 0, wanita: 0 },
      anak: { pria: 0, wanita: 0 },
      total: { pria: 0, wanita: 0 },
    },
    pesertaPerjamuan: 0,
    anggotaMajelis: Array(33).fill(""),
    picIbadah: "",
    organis: "",
    prokantor: ["", "", ""],
    operatorLcd: "",
    tanggalJakarta: new Date().toISOString().slice(0, 10),
    majelisGereja: "",
    evaluasi: {
      berjalanBaik: "",
      perluDiperbaiki: "",
    },
  };
}

/** Converts a saved ServiceReport to form values (fills missing slots) */
export function reportToFormValues(report: Record<string, unknown>): ServiceReportFormValues {
  const defaults = defaultFormValues();
  const r = report as Partial<ServiceReportFormValues>;

  // Pad anggotaMajelis array to 33 slots
  const majelis = Array.isArray(r.anggotaMajelis)
    ? [...r.anggotaMajelis, ...Array(33).fill("")].slice(0, 33)
    : defaults.anggotaMajelis;

  return {
    ...defaults,
    ...r,
    anggotaMajelis: majelis,
  } as ServiceReportFormValues;
}

/** Formats a number as Indonesian rupiah words (simple version) */
export function terbilang(n: number): string {
  if (n === 0) return "Nol rupiah";
  const satuan = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan",
    "sepuluh", "sebelas"];

  function convert(num: number): string {
    if (num < 12) return satuan[num];
    if (num < 20) return satuan[num - 10] + " belas";
    if (num < 100) return satuan[Math.floor(num / 10)] + " puluh" + (num % 10 ? " " + satuan[num % 10] : "");
    if (num < 200) return "seratus" + (num % 100 ? " " + convert(num % 100) : "");
    if (num < 1000) return satuan[Math.floor(num / 100)] + " ratus" + (num % 100 ? " " + convert(num % 100) : "");
    if (num < 2000) return "seribu" + (num % 1000 ? " " + convert(num % 1000) : "");
    if (num < 1_000_000) return convert(Math.floor(num / 1000)) + " ribu" + (num % 1000 ? " " + convert(num % 1000) : "");
    if (num < 1_000_000_000) return convert(Math.floor(num / 1_000_000)) + " juta" + (num % 1_000_000 ? " " + convert(num % 1_000_000) : "");
    return convert(Math.floor(num / 1_000_000_000)) + " miliar" + (num % 1_000_000_000 ? " " + convert(num % 1_000_000_000) : "");
  }

  const words = convert(Math.round(n));
  return words.charAt(0).toUpperCase() + words.slice(1) + " rupiah";
}

/** Auto-calculates total persembahan from form values */
export function calcJumlah(p: ServiceReportFormValues["persembahan"]): number {
  return (
    (p.melaluiKantong.rp || 0) +
    (p.bulanan || 0) +
    (p.syukur || 0) +
    (p.danaAbadi || 0) +
    (p.kasihPeduli || 0) +
    (p.syukurBaptisSidiNikah.rp || 0) +
    (p.syukurPerjamuan.rp || 0) +
    (p.perorangan || 0) +
    (p.pembangunan || 0) +
    (p.khusus || 0) +
    (p.lainLain || 0)
  );
}

/** Auto-calculates total kehadiran from individual service types */
export function calcTotalKehadiran(
  k: Omit<ServiceReportFormValues["kehadiranJemaat"], "total">,
): { pria: number; wanita: number } {
  return {
    pria: (k.umum.pria || 0) + (k.pemuda.pria || 0) + (k.remaja.pria || 0) + (k.anak.pria || 0),
    wanita:
      (k.umum.wanita || 0) +
      (k.pemuda.wanita || 0) +
      (k.remaja.wanita || 0) +
      (k.anak.wanita || 0),
  };
}
