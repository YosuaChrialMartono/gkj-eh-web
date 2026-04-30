import Link from "next/link"
import { ColorModeToggle } from "@/components/color-mode-toggle"

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-6 md:px-8">
          <Link
            href="/"
            className="font-serif text-lg font-semibold tracking-tight"
          >
            GKJ Eben Haezer
          </Link>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link
              href="/news"
              className="transition-colors hover:text-foreground"
            >
              Berita
            </Link>
            <Link
              href="/sermons"
              className="transition-colors hover:text-foreground"
            >
              Khotbah
            </Link>
            <Link
              href="/dashboard"
              className="transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <ColorModeToggle />
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} GKJ Eben Haezer · Bersekutu, bersaksi, melayani.
      </footer>
    </div>
  )
}
