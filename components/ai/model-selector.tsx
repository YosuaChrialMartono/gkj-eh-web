"use client";

import { MODELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
  className?: string;
}

export function ModelSelector({ value, onChange, className }: ModelSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-zinc-300",
        className
      )}
    >
      {MODELS.map((m) => (
        <option key={m.id} value={m.id}>
          {m.label}
        </option>
      ))}
    </select>
  );
}
