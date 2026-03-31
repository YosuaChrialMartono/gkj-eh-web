import { z } from "zod";

const offeringWithEnvelopeSchema = z.object({
  rp: z.number().min(0, "Jumlah tidak boleh negatif"),
  amplop: z.number().int().min(0, "Jumlah amplop tidak boleh negatif"),
});

const attendancePairSchema = z.object({
  pria: z.number().int().min(0, "Jumlah tidak boleh negatif"),
  wanita: z.number().int().min(0, "Jumlah tidak boleh negatif"),
});

export const serviceReportSchema = z.object({
  // Header
  jenisKebaktian: z.string().min(1, "Jenis kebaktian wajib diisi"),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  waktu: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu harus HH:MM"),

  // Sections 1–3
  pelayanFirman: z.string().min(1, "Pelayan firman wajib diisi"),
  perikopBacaan: z.string().min(1, "Perikop bacaan wajib diisi"),
  temaRenungan: z.string().min(1, "Tema renungan wajib diisi"),

  // Section 4
  pelayananKhusus: z.object({
    baptisKudusAnak: z.number().int().min(0),
    baptisKudusDewasa: z.number().int().min(0),
    mengakuPercaya: z.number().int().min(0),
    pemberkatanNikah: z
      .object({
        saudara: z.string(),
        saudari: z.string(),
      })
      .nullable(),
  }),

  // Section 5
  persembahan: z.object({
    melaluiKantong: offeringWithEnvelopeSchema,
    bulanan: z.number().min(0),
    syukur: z.number().min(0),
    danaAbadi: z.number().min(0),
    kasihPeduli: z.number().min(0),
    syukurBaptisSidiNikah: offeringWithEnvelopeSchema,
    syukurPerjamuan: offeringWithEnvelopeSchema,
    perorangan: z.number().min(0),
    pembangunan: z.number().min(0),
    khusus: z.number().min(0),
    lainLain: z.number().min(0),
    jumlah: z.number().min(0),
    terbilang: z.string(),
  }),

  // Section 6
  kehadiranJemaat: z.object({
    umum: attendancePairSchema,
    pemuda: attendancePairSchema,
    remaja: attendancePairSchema,
    anak: attendancePairSchema,
    total: attendancePairSchema,
  }),

  // Section 7
  pesertaPerjamuan: z.number().int().min(0),

  // Section 8
  anggotaMajelis: z.array(z.string()).max(33, "Maksimal 33 anggota majelis"),

  // Sections 9–12
  picIbadah: z.string(),
  organis: z.string(),
  prokantor: z.tuple([z.string(), z.string(), z.string()]),
  operatorLcd: z.string(),

  // Signatures
  tanggalJakarta: z.string(),
  majelisGereja: z.string(),

  // Evaluation
  evaluasi: z.object({
    berjalanBaik: z.string(),
    perluDiperbaiki: z.string(),
  }),
});

export type ServiceReportFormValues = z.infer<typeof serviceReportSchema>;
