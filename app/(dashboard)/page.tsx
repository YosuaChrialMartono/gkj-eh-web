import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

export default function DashboardHome() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Welcome to {APP_NAME}
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">{APP_DESCRIPTION}</p>
      </div>
    </div>
  );
}
