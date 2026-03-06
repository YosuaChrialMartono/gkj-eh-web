import Link from "next/link"
import { ColorModeToggle } from "@/components/color-mode-toggle"

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg">
            GKJ Eben Haezer
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/news" className="text-sm hover:text-foreground/80 transition-colors">
              Berita
            </Link>
            <Link href="/sermons" className="text-sm hover:text-foreground/80 transition-colors">
              Khotbah
            </Link>
            <Link href="/dashboard" className="text-sm hover:text-foreground/80 transition-colors">
              Dashboard
            </Link>
            <ColorModeToggle />
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 flex-1">
        {children}
      </main>
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} GKJ Eben Haezer. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
