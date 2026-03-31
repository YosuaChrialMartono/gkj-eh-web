"use client";

import { Autocomplete } from "@/components/ui/autocomplete";
import { useFormContext } from "react-hook-form";
import type { ServiceReportFormValues } from "@/lib/schemas/service-report";

interface CouncilGridProps {
  members: string[];
}

export function CouncilGrid({ members }: CouncilGridProps) {
  const { watch, setValue } = useFormContext<ServiceReportFormValues>();
  const values = watch("anggotaMajelis");

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {Array.from({ length: 33 }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-8 shrink-0 text-right text-xs text-zinc-500">{i + 1}.</span>
          <Autocomplete
            suggestions={members}
            value={values[i] ?? ""}
            onChange={(v) => setValue(`anggotaMajelis.${i}`, v)}
            placeholder={`Anggota ${i + 1}`}
          />
        </div>
      ))}
    </div>
  );
}
