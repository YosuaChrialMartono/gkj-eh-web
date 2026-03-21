"use client";

import { KeyboardEvent, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PromptInputProps {
  onSubmit: (value: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export function PromptInput({
  onSubmit,
  isLoading = false,
  placeholder = "Ask anything...",
  className,
}: PromptInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  return (
    <div
      className={cn(
        "flex items-end gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm dark:border-zinc-700 dark:bg-zinc-900",
        className
      )}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder={placeholder}
        disabled={isLoading}
        className="max-h-[200px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none disabled:opacity-50 dark:text-zinc-50 dark:placeholder:text-zinc-500"
      />
      <Button
        size="sm"
        onClick={handleSubmit}
        disabled={!value.trim() || isLoading}
        className="shrink-0"
      >
        {isLoading ? "..." : "Send"}
      </Button>
    </div>
  );
}
