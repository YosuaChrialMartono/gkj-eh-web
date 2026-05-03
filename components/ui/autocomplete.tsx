"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, useState, useRef, useEffect, useId } from "react";

interface AutocompleteProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  suggestions: string[];
  value: string;
  onChange: (value: string) => void;
  maxResults?: number;
}

const Autocomplete = forwardRef<HTMLInputElement, AutocompleteProps>(
  ({ className, suggestions, value, onChange, maxResults, ...props }, ref) => {
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(-1);
    const listId = useId();
    const containerRef = useRef<HTMLDivElement>(null);

    const matched = value
      ? suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase()))
      : suggestions;
    const filtered = maxResults ? matched.slice(0, maxResults) : matched;

    // Close dropdown when clicking outside
    useEffect(() => {
      function handleClick(e: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    function handleSelect(name: string) {
      onChange(name);
      setOpen(false);
      setHighlighted(-1);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (!open || filtered.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlighted((h) => Math.max(h - 1, 0));
      } else if (e.key === "Enter" && highlighted >= 0) {
        e.preventDefault();
        handleSelect(filtered[highlighted]);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }

    return (
      <div ref={containerRef} className="relative w-full">
        <input
          ref={ref}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open && filtered.length > 0}
          aria-controls={listId}
          autoComplete="off"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setHighlighted(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus-visible:ring-zinc-300",
            className,
          )}
          {...props}
        />
        {open && filtered.length > 0 && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
          >
            {filtered.map((name, i) => (
              <li
                key={name}
                role="option"
                aria-selected={i === highlighted}
                onMouseDown={() => handleSelect(name)}
                onMouseEnter={() => setHighlighted(i)}
                className={cn(
                  "cursor-pointer px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50",
                  i === highlighted
                    ? "bg-zinc-100 dark:bg-zinc-800"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800",
                )}
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
);

Autocomplete.displayName = "Autocomplete";

export { Autocomplete };
