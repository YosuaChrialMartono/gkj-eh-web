"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ServiceReportFormValues } from "@/lib/schemas/service-report";

export function TabEvaluasi() {
  const { register } = useFormContext<ServiceReportFormValues>();

  return (
    <div className="space-y-6">
      {/* Signatures */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Tanda Tangan & Keterangan
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Jakarta, Tanggal</label>
            <Input type="date" {...register("tanggalJakarta")} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Majelis Gereja (nama)</label>
            <Input placeholder="Nama majelis yang menandatangani" {...register("majelisGereja")} />
          </div>
        </div>
      </section>

      {/* Evaluation */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Evaluasi Jalannya Kebaktian
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              a. Hal-hal yang sudah berjalan baik
            </label>
            <Textarea
              rows={5}
              placeholder="Tuliskan hal-hal positif..."
              {...register("evaluasi.berjalanBaik")}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              b. Hal-hal yang perlu diperbaiki
            </label>
            <Textarea
              rows={5}
              placeholder="Tuliskan hal-hal yang perlu ditingkatkan..."
              {...register("evaluasi.perluDiperbaiki")}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
