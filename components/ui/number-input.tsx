"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  prefix?: string;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, prefix, ...props }, ref) => {
    if (prefix) {
      return (
        <div className="flex h-10 w-full overflow-hidden rounded-lg border border-zinc-200 bg-white focus-within:ring-2 focus-within:ring-zinc-900 focus-within:ring-offset-0 dark:border-zinc-700 dark:bg-zinc-900 dark:focus-within:ring-zinc-300">
          <span className="flex items-center border-r border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
            {prefix}
          </span>
          <input
            ref={ref}
            type="number"
            min={0}
            className={cn(
              "flex-1 bg-transparent px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-50 dark:placeholder:text-zinc-500",
              className,
            )}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        ref={ref}
        type="number"
        min={0}
        className={cn(
          "flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus-visible:ring-zinc-300",
          className,
        )}
        {...props}
      />
    );
  },
);

NumberInput.displayName = "NumberInput";

export { NumberInput };
