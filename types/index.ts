// Shared project types — add new types here as the project grows

// ─── Service Report ───────────────────────────────────────────────────────────

export interface NikahPair {
  saudara: string;
  saudari: string;
}

export interface PelayananKhusus {
  baptisKudusAnak: number;
  baptisKudusDewasa: number;
  mengakuPercaya: number;
  pemberkatanNikah: NikahPair | null;
}

export interface OfferingWithEnvelope {
  rp: number;
  amplop: number;
}

export interface Persembahan {
  melaluiKantong: OfferingWithEnvelope;
  bulanan: number;
  syukur: number;
  danaAbadi: number;
  kasihPeduli: number;
  syukurBaptisSidiNikah: OfferingWithEnvelope;
  syukurPerjamuan: OfferingWithEnvelope;
  perorangan: number;
  pembangunan: number;
  khusus: number;
  lainLain: number;
  /** Auto-calculated sum of all RP fields */
  jumlah: number;
  /** Written amount in words (terbilang) */
  terbilang: string;
}

export interface AttendancePair {
  pria: number;
  wanita: number;
}

export interface KehadiranJemaat {
  umum: AttendancePair;
  pemuda: AttendancePair;
  remaja: AttendancePair;
  anak: AttendancePair;
  /** Auto-calculated total */
  total: AttendancePair;
}

export interface Evaluasi {
  berjalanBaik: string;
  perluDiperbaiki: string;
}

export interface ServiceReport {
  id: string;
  createdAt: string;
  updatedAt: string;

  // Header
  jenisKebaktian: string;
  tanggal: string; // ISO date YYYY-MM-DD
  waktu: string;   // HH:MM

  // Sections 1–3
  pelayanFirman: string;
  perikopBacaan: string;
  temaRenungan: string;

  // Section 4
  pelayananKhusus: PelayananKhusus;

  // Section 5
  persembahan: Persembahan;

  // Section 6
  kehadiranJemaat: KehadiranJemaat;

  // Section 7
  pesertaPerjamuan: number;

  // Section 8
  anggotaMajelis: string[]; // up to 33 names

  // Sections 9–12
  picIbadah: string;
  organis: string;
  prokantor: [string, string, string];
  operatorLcd: string;

  // Signatures
  tanggalJakarta: string;
  majelisGereja: string;

  // Evaluation
  evaluasi: Evaluasi;
}

export type CreateServiceReportInput = Omit<ServiceReport, "id" | "createdAt" | "updatedAt">;
export type UpdateServiceReportInput = Partial<CreateServiceReportInput>;
