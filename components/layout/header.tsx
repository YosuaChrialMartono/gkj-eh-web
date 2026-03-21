import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 px-6 dark:border-zinc-800">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {APP_NAME}
        </span>
        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-950 dark:text-violet-300">
          AI
        </span>
      </Link>
      <nav className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
        <Link href="/chat" className="hover:text-zinc-900 dark:hover:text-zinc-50">
          Chat
        </Link>
        <Link href="/agents" className="hover:text-zinc-900 dark:hover:text-zinc-50">
          Agents
        </Link>
      </nav>
    </header>
  );
}
