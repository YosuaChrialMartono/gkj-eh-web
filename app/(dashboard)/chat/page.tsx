"use client";

import { useState } from "react";
import { ChatWindow } from "@/components/ai/chat-window";
import { ModelSelector } from "@/components/ai/model-selector";
import { DEFAULT_MODEL } from "@/lib/constants";
import { SYSTEM_PROMPTS, type SystemPromptKey } from "@/lib/ai/prompts";

const PERSONA_OPTIONS: { label: string; key: SystemPromptKey }[] = [
  { label: "Default", key: "default" },
  { label: "Code Review", key: "codeReview" },
  { label: "Data Analyst", key: "dataAnalyst" },
  { label: "Researcher", key: "researcher" },
  { label: "Writer", key: "writer" },
];

export default function ChatPage() {
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [persona, setPersona] = useState<SystemPromptKey>("default");

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-2 dark:border-zinc-800">
        <ModelSelector value={model} onChange={setModel} />
        <select
          value={persona}
          onChange={(e) => setPersona(e.target.value as SystemPromptKey)}
          className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        >
          {PERSONA_OPTIONS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <ChatWindow
        className="flex-1"
        options={{
          model,
          systemPrompt: SYSTEM_PROMPTS[persona],
          thinking: true,
        }}
      />
    </div>
  );
}
