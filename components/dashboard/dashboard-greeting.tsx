"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"

interface DashboardGreetingProps {
  draftCount: number
  jadwalCount: number
}

function timeOfDay(hour: number): string {
  if (hour >= 4 && hour < 10) return "pagi"
  if (hour >= 10 && hour < 15) return "siang"
  if (hour >= 15 && hour < 18) return "sore"
  return "malam"
}

export function DashboardGreeting({ draftCount, jadwalCount }: DashboardGreetingProps) {
  const { user } = useAuth()
  const [period, setPeriod] = useState("pagi")

  useEffect(() => {
    // Post-hydration only: reading browser-local time would mismatch SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPeriod(timeOfDay(new Date().getHours()))
  }, [])

  const name = user?.name?.split(/\s+/)[0] ?? "kembali"

  return (
    <div className="mb-9">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Selamat datang kembali
      </div>
      <h1 className="mb-2 font-serif text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
        Selamat {period}, {name}.
      </h1>
      <p className="text-sm text-muted-foreground">
        Ada{" "}
        <b className="text-foreground">{draftCount} draft</b>{" "}
        menunggu publikasi dan{" "}
        <b className="text-foreground">{jadwalCount} jadwal pelayan</b>{" "}
        minggu ini.
      </p>
    </div>
  )
}
