"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { OfferingRow } from "./offering-row";
import { calcJumlah, terbilang } from "@/lib/form-defaults";
import type { ServiceReportFormValues } from "@/lib/schemas/service-report";
import { useEffect } from "react";

export function TabPersembahan() {
  const { register, control, setValue } = useFormContext<ServiceReportFormValues>();

  // Watch all RP fields to auto-calculate total
  const persembahan = useWatch({ control, name: "persembahan" });

  useEffect(() => {
    const jumlah = calcJumlah(persembahan);
    setValue("persembahan.jumlah", jumlah);
    setValue("persembahan.terbilang", terbilang(jumlah));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    persembahan.melaluiKantong.rp,
    persembahan.bulanan,
    persembahan.syukur,
    persembahan.danaAbadi,
    persembahan.kasihPeduli,
    persembahan.syukurBaptisSidiNikah.rp,
    persembahan.syukurPerjamuan.rp,
    persembahan.perorangan,
    persembahan.pembangunan,
    persembahan.khusus,
    persembahan.lainLain,
  ]);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          5. Persembahan
        </h3>
        <p className="text-xs text-zinc-500">
          <sup>1</sup> Persembahan Minggu atau di hari biasa melalui kantong: Jumlah persembahan
          kebaktian umum dan pemuda
        </p>

        <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_auto] gap-x-3 sm:grid-cols-[200px_1fr_auto]">
            <span className="hidden text-xs font-medium text-zinc-500 sm:block" />
            <span className="text-xs font-medium text-zinc-500">Jumlah (Rp)</span>
            <span className="text-xs font-medium text-zinc-500">Amplop</span>
          </div>

          <OfferingRow
            label="5.1 Melalui Kantong¹"
            rpField="persembahan.melaluiKantong.rp"
            amplopField="persembahan.melaluiKantong.amplop"
            register={register}
          />
          <OfferingRow label="5.2 Bulanan" rpField="persembahan.bulanan" register={register} />
          <OfferingRow label="5.3 Syukur" rpField="persembahan.syukur" register={register} />
          <OfferingRow label="5.4 Dana Abadi" rpField="persembahan.danaAbadi" register={register} />
          <OfferingRow label="5.5 Kasih Peduli" rpField="persembahan.kasihPeduli" register={register} />
          <OfferingRow
            label="5.6 Syukur Baptis/Sidi/Nikah"
            rpField="persembahan.syukurBaptisSidiNikah.rp"
            amplopField="persembahan.syukurBaptisSidiNikah.amplop"
            register={register}
          />
          <OfferingRow
            label="5.7 Syukur Perjamuan Kudus"
            rpField="persembahan.syukurPerjamuan.rp"
            amplopField="persembahan.syukurPerjamuan.amplop"
            register={register}
          />
          <OfferingRow label="5.8 Perorangan" rpField="persembahan.perorangan" register={register} />
          <OfferingRow label="5.9 Pembangunan" rpField="persembahan.pembangunan" register={register} />
          <OfferingRow label="5.10 Khusus" rpField="persembahan.khusus" register={register} />
          <OfferingRow label="5.11 Lain-lain" rpField="persembahan.lainLain" register={register} />

          <div className="border-t border-zinc-200 pt-3 dark:border-zinc-700">
            <div className="grid grid-cols-[1fr_auto] gap-x-3 sm:grid-cols-[200px_1fr_auto]">
              <span className="hidden self-center text-sm font-semibold sm:block">Jumlah</span>
              <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
                <span className="text-sm font-semibold sm:hidden">Jumlah: </span>
                <span className="font-mono text-lg font-semibold">
                  Rp {(persembahan.jumlah || 0).toLocaleString("id-ID")}
                </span>
              </div>
              <div />
            </div>
            <div className="mt-2">
              <label className="mb-1 block text-xs text-zinc-500">Terbilang</label>
              <Input
                {...register("persembahan.terbilang")}
                placeholder="Otomatis terisi"
                className="italic text-zinc-600 dark:text-zinc-400"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
