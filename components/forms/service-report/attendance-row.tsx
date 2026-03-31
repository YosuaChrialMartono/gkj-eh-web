import { NumberInput } from "@/components/ui/number-input";
import { UseFormRegister, Path } from "react-hook-form";
import type { ServiceReportFormValues } from "@/lib/schemas/service-report";

interface AttendanceRowProps {
  label: string;
  priaField: Path<ServiceReportFormValues>;
  wanitaField: Path<ServiceReportFormValues>;
  register: UseFormRegister<ServiceReportFormValues>;
  readOnly?: boolean;
  priaValue?: number;
  wanitaValue?: number;
}

export function AttendanceRow({
  label,
  priaField,
  wanitaField,
  register,
  readOnly,
  priaValue,
  wanitaValue,
}: AttendanceRowProps) {
  return (
    <div className="grid grid-cols-[1fr_80px_80px] items-center gap-3">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      {readOnly ? (
        <>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-xs text-zinc-500">Pria</span>
            <span className="text-sm font-semibold">{priaValue ?? 0}</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-xs text-zinc-500">Wanita</span>
            <span className="text-sm font-semibold">{wanitaValue ?? 0}</span>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-0.5">
            <label className="text-xs text-zinc-500">Pria</label>
            <NumberInput
              placeholder="0"
              {...register(priaField, { valueAsNumber: true })}
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <label className="text-xs text-zinc-500">Wanita</label>
            <NumberInput
              placeholder="0"
              {...register(wanitaField, { valueAsNumber: true })}
            />
          </div>
        </>
      )}
    </div>
  );
}
