"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]

interface MonthPickerProps {
  month: string // "YYYY-MM"
}

export function MonthPicker({ month }: MonthPickerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [year, mon] = month.split("-").map(Number)
  const label = `${MONTHS_ID[mon - 1]} ${year}`

  function navigate(offset: number) {
    const date = new Date(year, mon - 1 + offset, 1)
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    const params = new URLSearchParams(searchParams.toString())
    params.set("month", newMonth)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={() => navigate(-1)} aria-label="Bulan sebelumnya">
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-[140px] text-center font-medium">{label}</span>
      <Button variant="outline" size="icon" onClick={() => navigate(1)} aria-label="Bulan berikutnya">
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}
