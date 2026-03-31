import { NumberInput } from "@/components/ui/number-input";
import { UseFormRegister, Path } from "react-hook-form";
import type { ServiceReportFormValues } from "@/lib/schemas/service-report";

interface OfferingRowProps {
  label: string;
  rpField: Path<ServiceReportFormValues>;
  amplopField?: Path<ServiceReportFormValues>;
  register: UseFormRegister<ServiceReportFormValues>;
}

export function OfferingRow({ label, rpField, amplopField, register }: OfferingRowProps) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 sm:grid-cols-[200px_1fr_auto]">
      <span className="col-span-2 self-center text-sm font-medium text-zinc-700 dark:text-zinc-300 sm:col-span-1">
        {label}
      </span>
      <NumberInput
        prefix="RP"
        placeholder="0"
        {...register(rpField, { valueAsNumber: true })}
      />
      {amplopField ? (
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-zinc-500">=</span>
          <NumberInput
            placeholder="0"
            className="w-20"
            {...register(amplopField, { valueAsNumber: true })}
          />
          <span className="text-sm text-zinc-500">amplop</span>
        </div>
      ) : (
        <div /> // spacer to keep grid consistent when no amplop
      )}
    </div>
  );
}
