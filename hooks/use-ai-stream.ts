"use client";

import { useState, useCallback } from "react";

interface StreamOptions {
  onChunk?: (text: string) => void;
  onThinking?: (text: string) => void;
  onDone?: (fullText: string) => void;
  onError?: (error: string) => void;
}

export function useAIStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [text, setText] = useState("");
  const [thinking, setThinking] = useState("");

  const stream = useCallback(
    async (
      endpoint: string,
      body: Record<string, unknown>,
      options: StreamOptions = {}
    ) => {
      setIsStreaming(true);
      setText("");
      setThinking("");

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let fullText = "";

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
                fullText += chunk.content;
                setText(fullText);
                options.onChunk?.(chunk.content);
              } else if (chunk.type === "thinking") {
                setThinking((prev) => prev + chunk.content);
                options.onThinking?.(chunk.content);
              }
            } catch {
              // skip
            }
          }
        }

        options.onDone?.(fullText);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Stream error";
        options.onError?.(message);
      } finally {
        setIsStreaming(false);
      }
    },
    []
  );

  return { stream, isStreaming, text, thinking };
}
