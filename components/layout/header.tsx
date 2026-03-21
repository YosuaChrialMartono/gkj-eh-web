import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function Header() {
  return (
    <header className="flex h-14 items-center border-b border-zinc-200 px-6 dark:border-zinc-800">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {APP_NAME}
        </span>
      </Link>
    </header>
  );
}
