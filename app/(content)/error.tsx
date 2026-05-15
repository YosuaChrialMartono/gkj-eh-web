"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ContentError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-2xl font-semibold">Halaman tidak dapat dimuat</h2>
      <p className="text-muted-foreground">
        Terjadi kesalahan saat mengambil data. Silakan coba lagi.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="default">
          Coba lagi
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Kembali ke beranda</Link>
        </Button>
      </div>
    </div>
  )
}
