import Link from "next/link";
import { MODELS, APP_NAME } from "@/lib/constants";

export default function DashboardHome() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Welcome to {APP_NAME}
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          An AI-powered platform built on Claude
        </p>
      </div>

      <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
        <Link
          href="/chat"
          className="group flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 transition-colors hover:border-violet-300 hover:bg-violet-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-violet-700 dark:hover:bg-violet-950"
        >
          <span className="text-2xl">💬</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">Chat</span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Streaming conversation with adaptive thinking
          </span>
        </Link>

        <Link
          href="/agents"
          className="group flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 transition-colors hover:border-violet-300 hover:bg-violet-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-violet-700 dark:hover:bg-violet-950"
        >
          <span className="text-2xl">🤖</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">Agents</span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Tool-equipped agents with agentic loops
          </span>
        </Link>
      </div>

      <div className="w-full max-w-xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Available Models
        </p>
        <div className="flex flex-col gap-2">
          {MODELS.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{m.label}</span>
              <span className="text-xs text-zinc-400">{m.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
