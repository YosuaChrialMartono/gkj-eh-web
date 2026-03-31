"use client";

import { useFormContext } from "react-hook-form";
import { Autocomplete } from "@/components/ui/autocomplete";
import { CouncilGrid } from "./council-grid";
import type { ServiceReportFormValues } from "@/lib/schemas/service-report";

interface TabPetugasProps {
  members: string[];
}

export function TabPetugas({ members }: TabPetugasProps) {
  const { watch, setValue } = useFormContext<ServiceReportFormValues>();

  const picIbadah = watch("picIbadah");
  const organis = watch("organis");
  const prokantor = watch("prokantor");
  const operatorLcd = watch("operatorLcd");

  return (
    <div className="space-y-6">
      {/* Section 8 */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          8. Anggota Majelis yang Hadir
        </h3>
        <CouncilGrid members={members} />
      </section>

      {/* Sections 9–12 */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Petugas Ibadah
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">9. PIC Ibadah</label>
            <Autocomplete
              suggestions={members}
              value={picIbadah}
              onChange={(v) => setValue("picIbadah", v)}
              placeholder="Nama PIC ibadah"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">10. Organis</label>
            <Autocomplete
              suggestions={members}
              value={organis}
              onChange={(v) => setValue("organis", v)}
              placeholder="Nama organis"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">11. Prokantor</label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {([0, 1, 2] as const).map((i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="shrink-0 text-sm text-zinc-500">{i + 1}.</span>
                <Autocomplete
                  suggestions={members}
                  value={prokantor[i] ?? ""}
                  onChange={(v) => {
                    const next = [...prokantor] as [string, string, string];
                    next[i] = v;
                    setValue("prokantor", next);
                  }}
                  placeholder={`Prokantor ${i + 1}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="sm:max-w-sm">
          <label className="mb-1.5 block text-sm font-medium">12. Operator LCD</label>
          <Autocomplete
            suggestions={members}
            value={operatorLcd}
            onChange={(v) => setValue("operatorLcd", v)}
            placeholder="Nama operator LCD"
          />
        </div>
      </section>
    </div>
  );
}
