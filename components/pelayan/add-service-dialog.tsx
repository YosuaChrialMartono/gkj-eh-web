"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth/auth-context"

interface AddServiceDialogProps {
  existingDates: string[]
}

export function AddServiceDialog({ existingDates }: AddServiceDialogProps) {
  const { accessToken } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState("")
  const [label, setLabel] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleConfirm() {
    if (!date) {
      toast.error("Pilih tanggal layanan")
      return
    }
    if (existingDates.includes(date)) {
      toast.error("Tanggal tersebut sudah ada dalam daftar")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/pelayan/services", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ date, label: label || undefined, isExtra: true }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Gagal menyimpan" }))
        throw new Error(err.message)
      }
      toast.success("Layanan tambahan berhasil ditambahkan")
      setOpen(false)
      setDate("")
      setLabel("")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-1 size-4" />
        Tambah Layanan
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Tambah Layanan Khusus</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="extra-date">Tanggal</Label>
              <Input
                id="extra-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="extra-label">Label (opsional)</Label>
              <Input
                id="extra-label"
                placeholder="Misal: Ibadah Natal"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button onClick={handleConfirm} disabled={saving}>
              {saving ? "Menyimpan..." : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
