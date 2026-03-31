/**
 * In-memory mock store for development.
 * Swap out the API routes to proxy to the real external API when ready.
 */

import { generateId } from "@/lib/utils";
import type { ServiceReport, CreateServiceReportInput, UpdateServiceReportInput } from "@/types";

// ─── Seed data ────────────────────────────────────────────────────────────────

const seedReports: ServiceReport[] = [
  {
    id: "mock-001",
    createdAt: "2026-03-15T08:00:00.000Z",
    updatedAt: "2026-03-15T10:00:00.000Z",
    jenisKebaktian: "Kebaktian Minggu Umum",
    tanggal: "2026-03-15",
    waktu: "08:00",
    pelayanFirman: "Pdt. Yohanes Santoso",
    perikopBacaan: "Yohanes 3:16-21",
    temaRenungan: "Kasih Allah yang Sempurna",
    pelayananKhusus: {
      baptisKudusAnak: 2,
      baptisKudusDewasa: 0,
      mengakuPercaya: 1,
      pemberkatanNikah: null,
    },
    persembahan: {
      melaluiKantong: { rp: 3500000, amplop: 12 },
      bulanan: 1200000,
      syukur: 500000,
      danaAbadi: 250000,
      kasihPeduli: 300000,
      syukurBaptisSidiNikah: { rp: 750000, amplop: 3 },
      syukurPerjamuan: { rp: 0, amplop: 0 },
      perorangan: 200000,
      pembangunan: 400000,
      khusus: 0,
      lainLain: 100000,
      jumlah: 7200000,
      terbilang: "Tujuh juta dua ratus ribu rupiah",
    },
    kehadiranJemaat: {
      umum: { pria: 85, wanita: 112 },
      pemuda: { pria: 22, wanita: 28 },
      remaja: { pria: 15, wanita: 18 },
      anak: { pria: 20, wanita: 25 },
      total: { pria: 142, wanita: 183 },
    },
    pesertaPerjamuan: 0,
    anggotaMajelis: [
      "Bpk. Andreas Wijaya",
      "Bpk. Budi Hartono",
      "Ibu. Christine Susanto",
      "Bpk. David Lim",
    ],
    picIbadah: "Ibu. Evelyn Tanoto",
    organis: "Bpk. Felix Santoso",
    prokantor: ["Ibu. Grace Halim", "Bpk. Henry Gunawan", ""],
    operatorLcd: "Sdri. Irene Kusuma",
    tanggalJakarta: "2026-03-15",
    majelisGereja: "Bpk. Andreas Wijaya",
    evaluasi: {
      berjalanBaik: "Pujian dan liturgi berjalan dengan tertib dan khidmat.",
      perluDiperbaiki: "Sound system di sebelah kanan ruangan kurang jelas.",
    },
  },
  {
    id: "mock-002",
    createdAt: "2026-03-22T08:00:00.000Z",
    updatedAt: "2026-03-22T10:30:00.000Z",
    jenisKebaktian: "Kebaktian Minggu Umum",
    tanggal: "2026-03-22",
    waktu: "08:00",
    pelayanFirman: "Pdt. Maria Harahap",
    perikopBacaan: "Mazmur 23:1-6",
    temaRenungan: "Tuhan adalah Gembalaku",
    pelayananKhusus: {
      baptisKudusAnak: 0,
      baptisKudusDewasa: 1,
      mengakuPercaya: 0,
      pemberkatanNikah: { saudara: "Antonius Budiman", saudari: "Lestari Purnama" },
    },
    persembahan: {
      melaluiKantong: { rp: 4100000, amplop: 15 },
      bulanan: 1500000,
      syukur: 800000,
      danaAbadi: 300000,
      kasihPeduli: 250000,
      syukurBaptisSidiNikah: { rp: 500000, amplop: 1 },
      syukurPerjamuan: { rp: 0, amplop: 0 },
      perorangan: 350000,
      pembangunan: 500000,
      khusus: 1000000,
      lainLain: 150000,
      jumlah: 9450000,
      terbilang: "Sembilan juta empat ratus lima puluh ribu rupiah",
    },
    kehadiranJemaat: {
      umum: { pria: 92, wanita: 120 },
      pemuda: { pria: 25, wanita: 30 },
      remaja: { pria: 18, wanita: 20 },
      anak: { pria: 22, wanita: 28 },
      total: { pria: 157, wanita: 198 },
    },
    pesertaPerjamuan: 0,
    anggotaMajelis: [
      "Bpk. Andreas Wijaya",
      "Ibu. Christine Susanto",
      "Bpk. David Lim",
      "Ibu. Evelyn Tanoto",
      "Bpk. Felix Santoso",
    ],
    picIbadah: "Bpk. Budi Hartono",
    organis: "Bpk. Felix Santoso",
    prokantor: ["Ibu. Grace Halim", "", ""],
    operatorLcd: "Sdri. Irene Kusuma",
    tanggalJakarta: "2026-03-22",
    majelisGereja: "Ibu. Christine Susanto",
    evaluasi: {
      berjalanBaik: "Pemberkatan nikah berlangsung khidmat dan lancar.",
      perluDiperbaiki: "Perlu koordinasi lebih baik antara organis dan prokantor.",
    },
  },
];

// ─── Seed member list ─────────────────────────────────────────────────────────

const seedMembers: string[] = [
  "Pdt. Yohanes Santoso",
  "Pdt. Maria Harahap",
  "Bpk. Andreas Wijaya",
  "Bpk. Budi Hartono",
  "Ibu. Christine Susanto",
  "Bpk. David Lim",
  "Ibu. Evelyn Tanoto",
  "Bpk. Felix Santoso",
  "Ibu. Grace Halim",
  "Bpk. Henry Gunawan",
  "Sdri. Irene Kusuma",
  "Sdr. James Hartono",
  "Ibu. Karen Wijaya",
  "Bpk. Leonard Tan",
  "Ibu. Michelle Soeharso",
  "Bpk. Nathan Kusuma",
  "Ibu. Olivia Pramudita",
  "Bpk. Peter Santoso",
  "Ibu. Rachel Halim",
  "Bpk. Samuel Gunawan",
];

// ─── Mutable in-memory store ──────────────────────────────────────────────────

const reports: ServiceReport[] = [...seedReports];

// ─── CRUD operations ──────────────────────────────────────────────────────────

export function getAllReports(): ServiceReport[] {
  return [...reports].sort(
    (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime(),
  );
}

export function getReportById(id: string): ServiceReport | undefined {
  return reports.find((r) => r.id === id);
}

export function createReport(input: CreateServiceReportInput): ServiceReport {
  const now = new Date().toISOString();
  const report: ServiceReport = {
    ...input,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  reports.push(report);
  return report;
}

export function updateReport(
  id: string,
  input: UpdateServiceReportInput,
): ServiceReport | undefined {
  const idx = reports.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  const updated: ServiceReport = {
    ...reports[idx],
    ...input,
    id,
    createdAt: reports[idx].createdAt,
    updatedAt: new Date().toISOString(),
  };
  reports[idx] = updated;
  return updated;
}

export function deleteReport(id: string): boolean {
  const idx = reports.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  reports.splice(idx, 1);
  return true;
}

export function getMembers(): string[] {
  return [...seedMembers];
}
