"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { NumberInput } from "@/components/ui/number-input";
import type { ServiceReportFormValues } from "@/lib/schemas/service-report";

const JENIS_KEBAKTIAN_OPTIONS = [
  "Kebaktian Minggu Umum",
  "Kebaktian Minggu Pemuda",
  "Kebaktian Minggu Remaja",
  "Kebaktian Minggu Anak",
  "Kebaktian Perjamuan Kudus",
  "Kebaktian Hari Raya",
  "Kebaktian Khusus",
];

export function TabInfo() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ServiceReportFormValues>();

  const hasNikah = watch("pelayananKhusus.pemberkatanNikah") !== null;

  function toggleNikah(checked: boolean) {
    setValue(
      "pelayananKhusus.pemberkatanNikah",
      checked ? { saudara: "", saudari: "" } : null,
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Identitas Kebaktian
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="mb-1.5 block text-sm font-medium">Jenis Kebaktian</label>
            <Select {...register("jenisKebaktian")}>
              <option value="">-- Pilih Jenis --</option>
              {JENIS_KEBAKTIAN_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
            {errors.jenisKebaktian && (
              <p className="mt-1 text-xs text-red-500">{errors.jenisKebaktian.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Tanggal</label>
            <Input type="date" {...register("tanggal")} />
            {errors.tanggal && (
              <p className="mt-1 text-xs text-red-500">{errors.tanggal.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Waktu</label>
            <Input type="time" {...register("waktu")} />
            {errors.waktu && (
              <p className="mt-1 text-xs text-red-500">{errors.waktu.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* Sections 1–3 */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Pelayanan Firman
        </h3>
        <div>
          <label className="mb-1.5 block text-sm font-medium">1. Pelayan Firman</label>
          <Input placeholder="Nama pendeta / pengkhotbah" {...register("pelayanFirman")} />
          {errors.pelayanFirman && (
            <p className="mt-1 text-xs text-red-500">{errors.pelayanFirman.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">2. Perikop Bacaan</label>
          <Input placeholder="mis. Yohanes 3:16-21" {...register("perikopBacaan")} />
          {errors.perikopBacaan && (
            <p className="mt-1 text-xs text-red-500">{errors.perikopBacaan.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">3. Tema Renungan</label>
          <Input placeholder="Judul / tema khotbah" {...register("temaRenungan")} />
          {errors.temaRenungan && (
            <p className="mt-1 text-xs text-red-500">{errors.temaRenungan.message}</p>
          )}
        </div>
      </section>

      {/* Section 4 */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          4. Pelayanan Khusus
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium">4.1 Baptis Kudus Anak</label>
            <div className="flex items-center gap-2">
              <NumberInput
                className="w-24"
                {...register("pelayananKhusus.baptisKudusAnak", { valueAsNumber: true })}
              />
              <span className="text-sm text-zinc-500">orang</span>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">4.2 Baptis Kudus Dewasa</label>
            <div className="flex items-center gap-2">
              <NumberInput
                className="w-24"
                {...register("pelayananKhusus.baptisKudusDewasa", { valueAsNumber: true })}
              />
              <span className="text-sm text-zinc-500">orang</span>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">4.3 Mengaku Percaya (Sidi)</label>
            <div className="flex items-center gap-2">
              <NumberInput
                className="w-24"
                {...register("pelayananKhusus.mengakuPercaya", { valueAsNumber: true })}
              />
              <span className="text-sm text-zinc-500">orang</span>
            </div>
          </div>
        </div>

        {/* 4.4 Pemberkatan Nikah */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={hasNikah}
              onChange={(e) => toggleNikah(e.target.checked)}
              className="rounded border-zinc-300"
            />
            4.4 Pemberkatan Nikah
          </label>
          {hasNikah && (
            <div className="ml-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  4.4.1 Saudara (Pengantin Pria)
                </label>
                <Input
                  placeholder="Nama pengantin pria"
                  {...register("pelayananKhusus.pemberkatanNikah.saudara")}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  4.4.2 Saudari (Pengantin Wanita)
                </label>
                <Input
                  placeholder="Nama pengantin wanita"
                  {...register("pelayananKhusus.pemberkatanNikah.saudari")}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
