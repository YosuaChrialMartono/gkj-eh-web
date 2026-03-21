"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/chat-store";
import { Button } from "@/components/ui/button";
import { truncate } from "@/lib/utils";

const NAV = [
  { label: "Chat", href: "/chat" },
  { label: "Agents", href: "/agents" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sessions, activeSessionId, createSession, setActiveSession } = useChatStore();

  return (
    <aside className="flex w-60 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      {/* Nav */}
      <nav className="flex flex-col gap-1 p-3">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith(item.href)
                ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={() => createSession()}
        >
          + New Chat
        </Button>
      </div>

      {/* Sessions */}
      <div className="flex-1 overflow-y-auto p-3">
        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
          Recent
        </p>
        <div className="flex flex-col gap-0.5">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setActiveSession(session.id)}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                activeSessionId === session.id
                  ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              )}
            >
              {truncate(session.title, 28)}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
