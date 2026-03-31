"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { NumberInput } from "@/components/ui/number-input";
import { AttendanceRow } from "./attendance-row";
import { calcTotalKehadiran } from "@/lib/form-defaults";
import type { ServiceReportFormValues } from "@/lib/schemas/service-report";
import { useEffect } from "react";

export function TabKehadiran() {
  const { register, control, setValue } = useFormContext<ServiceReportFormValues>();

  const kehadiran = useWatch({ control, name: "kehadiranJemaat" });

  useEffect(() => {
    const total = calcTotalKehadiran(kehadiran);
    setValue("kehadiranJemaat.total.pria", total.pria);
    setValue("kehadiranJemaat.total.wanita", total.wanita);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    kehadiran.umum.pria, kehadiran.umum.wanita,
    kehadiran.pemuda.pria, kehadiran.pemuda.wanita,
    kehadiran.remaja.pria, kehadiran.remaja.wanita,
    kehadiran.anak.pria, kehadiran.anak.wanita,
  ]);

  const total = calcTotalKehadiran(kehadiran);

  return (
    <div className="space-y-6">
      {/* Section 6 */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          6. Kehadiran Jemaat
        </h3>
        <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_80px_80px] items-center gap-3">
            <span />
            <span className="text-center text-xs font-medium text-zinc-500">Pria</span>
            <span className="text-center text-xs font-medium text-zinc-500">Wanita</span>
          </div>

          <AttendanceRow
            label="6.1 Kebaktian Umum"
            priaField="kehadiranJemaat.umum.pria"
            wanitaField="kehadiranJemaat.umum.wanita"
            register={register}
          />
          <AttendanceRow
            label="6.2 Kebaktian Pemuda"
            priaField="kehadiranJemaat.pemuda.pria"
            wanitaField="kehadiranJemaat.pemuda.wanita"
            register={register}
          />
          <AttendanceRow
            label="6.3 Kebaktian Remaja"
            priaField="kehadiranJemaat.remaja.pria"
            wanitaField="kehadiranJemaat.remaja.wanita"
            register={register}
          />
          <AttendanceRow
            label="6.4 Kebaktian Anak"
            priaField="kehadiranJemaat.anak.pria"
            wanitaField="kehadiranJemaat.anak.wanita"
            register={register}
          />

          <div className="border-t border-zinc-200 pt-3 dark:border-zinc-700">
            <AttendanceRow
              label="Total"
              priaField="kehadiranJemaat.total.pria"
              wanitaField="kehadiranJemaat.total.wanita"
              register={register}
              readOnly
              priaValue={total.pria}
              wanitaValue={total.wanita}
            />
            <p className="mt-1 text-right text-xs text-zinc-500">
              Grand total: {total.pria + total.wanita} orang
            </p>
          </div>
        </div>
      </section>

      {/* Section 7 */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          7. Peserta Perjamuan Kudus
        </h3>
        <div className="flex items-center gap-3">
          <NumberInput
            className="w-32"
            {...register("pesertaPerjamuan", { valueAsNumber: true })}
          />
          <span className="text-sm text-zinc-500">orang</span>
        </div>
      </section>
    </div>
  );
}
