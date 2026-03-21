"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PromptInput } from "@/components/ai/prompt-input";
import { ModelSelector } from "@/components/ai/model-selector";
import { ALL_TOOLS } from "@/lib/ai/tools";
import { DEFAULT_MODEL } from "@/lib/constants";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";

interface AgentResult {
  content: string;
  thinking?: string;
  toolCalls: Array<{ name: string; input: unknown; result: string }>;
  usage?: { input_tokens: number; output_tokens: number };
}

export default function AgentsPage() {
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showThinking, setShowThinking] = useState(false);

  const toggleTool = (name: string) =>
    setSelectedTools((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );

  const handleSubmit = async (message: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          model,
          tools: selectedTools,
          systemPrompt: SYSTEM_PROMPTS.default,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Request failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-auto p-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Agent Runner</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Configure tools and run an agentic loop with Claude
        </p>
      </div>

      {/* Config */}
      <div className="flex flex-wrap items-center gap-3">
        <ModelSelector value={model} onChange={setModel} />

        <div className="flex flex-wrap gap-2">
          {ALL_TOOLS.map((tool) => (
            <button
              key={tool.name}
              onClick={() => toggleTool(tool.name)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                selectedTools.includes(tool.name)
                  ? "border-violet-500 bg-violet-100 text-violet-700 dark:border-violet-600 dark:bg-violet-950 dark:text-violet-300"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
              }`}
            >
              {tool.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <PromptInput onSubmit={handleSubmit} isLoading={isLoading} placeholder="Give the agent a task..." />

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Result */}
      {result && (
        <div className="flex flex-col gap-4">
          {/* Tool calls */}
          {result.toolCalls.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Tool Calls ({result.toolCalls.length})
              </p>
              <div className="flex flex-col gap-2">
                {result.toolCalls.map((tc, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <span className="font-medium text-violet-700 dark:text-violet-300">{tc.name}</span>
                    <pre className="mt-1 overflow-x-auto text-xs text-zinc-500 dark:text-zinc-400">
                      {JSON.stringify(tc.input, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Thinking */}
          {result.thinking && (
            <div>
              <button
                onClick={() => setShowThinking((p) => !p)}
                className="text-xs text-zinc-400 underline-offset-2 hover:underline"
              >
                {showThinking ? "Hide" : "Show"} reasoning
              </button>
              {showThinking && (
                <div className="mt-2 rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs text-violet-800 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300">
                  <pre className="whitespace-pre-wrap font-sans">{result.thinking}</pre>
                </div>
              )}
            </div>
          )}

          {/* Response */}
          <div className="rounded-2xl bg-zinc-100 px-5 py-4 text-sm leading-relaxed text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
            <p className="whitespace-pre-wrap">{result.content}</p>
          </div>

          {result.usage && (
            <p className="text-xs text-zinc-400">
              {result.usage.input_tokens} in · {result.usage.output_tokens} out
            </p>
          )}
        </div>
      )}
    </div>
  );
}
