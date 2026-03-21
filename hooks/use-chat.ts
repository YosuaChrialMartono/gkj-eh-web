"use client";

import { useState, useCallback } from "react";
import { useChatStore } from "@/stores/chat-store";
import type { AIRequestOptions } from "@/types/ai";
import { DEFAULT_MODEL } from "@/lib/constants";

export function useChat(sessionId?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addMessage, updateMessage, createSession, activeSessionId } = useChatStore();

  const sendMessage = useCallback(
    async (content: string, options: AIRequestOptions = {}) => {
      const sid = sessionId ?? activeSessionId ?? createSession();
      setError(null);
      setIsLoading(true);

      // Add user message
      addMessage(sid, { role: "user", content });

      // Placeholder assistant message for streaming
      const assistantId = addMessage(sid, {
        role: "assistant",
        content: "",
        isStreaming: true,
      });

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sid,
            message: content,
            model: options.model ?? DEFAULT_MODEL,
            systemPrompt: options.systemPrompt,
            thinking: options.thinking ?? true,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "Request failed");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let accumulated = "";
        let thinkingAccumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const lines = decoder.decode(value).split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw || raw === "[DONE]") continue;

            try {
              const chunk = JSON.parse(raw);
              if (chunk.type === "text") {
                accumulated += chunk.content;
                updateMessage(sid, assistantId, { content: accumulated });
              } else if (chunk.type === "thinking") {
                thinkingAccumulated += chunk.content;
                updateMessage(sid, assistantId, { thinking: thinkingAccumulated });
              }
            } catch {
              // Malformed SSE chunk — skip
            }
          }
        }

        updateMessage(sid, assistantId, { isStreaming: false });
      } catch (err) {
        const message = err instanceof Error ? err.message : "An error occurred";
        setError(message);
        updateMessage(sid, assistantId, {
          content: `Error: ${message}`,
          isStreaming: false,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, activeSessionId, createSession, addMessage, updateMessage]
  );

  return { sendMessage, isLoading, error };
}
