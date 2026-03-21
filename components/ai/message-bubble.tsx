"use client";

import { cn, formatTimestamp } from "@/lib/utils";
import type { ChatMessage } from "@/types/ai";
import { useState } from "react";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [showThinking, setShowThinking] = useState(false);

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          isUser
            ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
            : "bg-violet-600 text-white"
        )}
      >
        {isUser ? "U" : "AI"}
      </div>

      <div className={cn("flex max-w-[75%] flex-col gap-1", isUser && "items-end")}>
        {/* Thinking toggle */}
        {message.thinking && (
          <button
            onClick={() => setShowThinking((p) => !p)}
            className="self-start text-xs text-zinc-400 underline-offset-2 hover:underline dark:text-zinc-500"
          >
            {showThinking ? "Hide" : "Show"} reasoning
          </button>
        )}

        {/* Thinking block */}
        {showThinking && message.thinking && (
          <div className="w-full rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs text-violet-800 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300">
            <p className="mb-1 font-semibold">Thinking</p>
            <pre className="whitespace-pre-wrap font-sans">{message.thinking}</pre>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
          )}
        >
          {message.isStreaming && !message.content ? (
            <span className="inline-flex gap-1">
              <span className="animate-bounce">·</span>
              <span className="animate-bounce [animation-delay:150ms]">·</span>
              <span className="animate-bounce [animation-delay:300ms]">·</span>
            </span>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        <span className="text-[10px] text-zinc-400 dark:text-zinc-600">
          {formatTimestamp(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
