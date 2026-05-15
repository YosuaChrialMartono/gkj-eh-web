"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardError({
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-2xl font-semibold">Terjadi kesalahan</h2>
      <p className="text-muted-foreground">
        Dashboard gagal memuat data. Silakan coba lagi.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="default">
          Coba lagi
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
