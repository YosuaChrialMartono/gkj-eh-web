"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import { PromptInput } from "./prompt-input";
import { useChat } from "@/hooks/use-chat";
import { useChatStore } from "@/stores/chat-store";
import type { AIRequestOptions } from "@/types/ai";

interface ChatWindowProps {
  sessionId?: string;
  options?: AIRequestOptions;
  className?: string;
}

export function ChatWindow({ sessionId, options, className }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { sendMessage, isLoading, error } = useChat(sessionId);
  const { sessions, activeSessionId } = useChatStore();

  const sid = sessionId ?? activeSessionId;
  const session = sessions.find((s) => s.id === sid);
  const messages = session?.messages ?? [];

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSubmit = (content: string) => {
    sendMessage(content, options);
  };

  return (
    <div className={`flex flex-col h-full ${className ?? ""}`}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-3 text-4xl">✦</div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Start a conversation
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        )}

        {error && (
          <p className="mt-2 text-center text-xs text-red-500">{error}</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-100 px-4 py-4 dark:border-zinc-800">
        <div className="mx-auto max-w-2xl">
          <PromptInput onSubmit={handleSubmit} isLoading={isLoading} />
          <p className="mt-2 text-center text-[10px] text-zinc-400">
            Press Enter to send · Shift+Enter for newline
          </p>
        </div>
      </div>
    </div>
  );
}
