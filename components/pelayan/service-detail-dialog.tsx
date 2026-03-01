"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth/auth-context"
import type { PelayanRole, PelayanPerson, PelayanAssignment, PelayanService } from "@/lib/types"
import type { ServiceRow } from "@/lib/pelayan-utils"
import { isVirtualRow } from "@/lib/pelayan-utils"

interface ServiceDetailDialogProps {
  serviceRow: ServiceRow
  roles: PelayanRole[]
  persons: PelayanPerson[]
  initialAssignments: PelayanAssignment[]
  open: boolean
  onClose: () => void
  onDeleted?: (date: string) => void
}

function formatDateId(date: string): string {
  const d = new Date(date + "T00:00:00")
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
}

interface RoleComboboxProps {
  roleId: string
  currentName: string
  persons: PelayanPerson[]
  onChange: (name: string) => void
}

function RoleCombobox({ currentName, persons, onChange }: RoleComboboxProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const filtered = inputValue
    ? persons.filter((p) => p.name.toLowerCase().includes(inputValue.toLowerCase()))
    : persons

  const showAddNew = inputValue.trim() && !persons.some((p) => p.name.toLowerCase() === inputValue.toLowerCase())

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-8 w-full justify-between font-normal", !currentName && "text-muted-foreground")}
        >
          <span className="truncate">{currentName || "Pilih pelayan..."}</span>
          <ChevronsUpDown className="ml-1 size-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Cari nama..." value={inputValue} onValueChange={setInputValue} />
          <CommandList>
            <CommandEmpty>Tidak ada hasil.</CommandEmpty>
            <CommandGroup>
              {filtered.map((p) => (
                <CommandItem
                  key={p.id}
                  value={p.name}
                  onSelect={() => {
                    onChange(p.name)
                    setOpen(false)
                    setInputValue("")
                  }}
                >
                  <Check className={cn("mr-2 size-4", currentName === p.name ? "opacity-100" : "opacity-0")} />
                  {p.name}
                </CommandItem>
              ))}
              {showAddNew && (
                <CommandItem
                  value={`__new__${inputValue}`}
                  onSelect={() => {
                    onChange(inputValue)
                    setOpen(false)
                    setInputValue("")
                  }}
                >
                  <span className="text-muted-foreground">Tambah &ldquo;{inputValue}&rdquo;</span>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function ServiceDetailDialog({
  serviceRow,
  roles,
  persons,
  initialAssignments,
  open,
  onClose,
  onDeleted,
}: ServiceDetailDialogProps) {
  const { accessToken } = useAuth()
  const isVirtual = isVirtualRow(serviceRow)

  const [label, setLabel] = useState(isVirtual ? "" : (serviceRow.label ?? ""))
  const [assignments, setAssignments] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const a of initialAssignments) {
      map[a.roleId] = a.pelayanName
    }
    return map
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      let serviceId: string
      if (isVirtual) {
        const res = await fetch("/api/pelayan/services", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ date: serviceRow.date, label: label || undefined, isExtra: false }),
        })
        if (!res.ok) throw new Error("Gagal membuat data ibadah")
        const svc = await res.json() as PelayanService
        serviceId = svc.id
      } else {
        serviceId = serviceRow.id
        if (label !== (serviceRow.label ?? "")) {
          await fetch(`/api/pelayan/services/${serviceId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify({ date: serviceRow.date, label: label || undefined, isExtra: serviceRow.isExtra }),
          })
        }
      }

      await Promise.all(
        roles
          .filter((r) => assignments[r.id]?.trim())
          .map((r) =>
            fetch("/api/pelayan/assignments", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
              body: JSON.stringify({ serviceId, roleId: r.id, pelayanName: assignments[r.id] }),
            })
          )
      )

      toast.success("Jadwal berhasil disimpan")
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (isVirtual) return
    setDeleting(true)
    try {
      await fetch(`/api/pelayan/services/${serviceRow.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      toast.success("Layanan dihapus")
      onDeleted?.(serviceRow.date)
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{formatDateId(serviceRow.date)}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="service-label">Label (opsional)</Label>
            <Input
              id="service-label"
              placeholder="Misal: Ibadah Paskah"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-sm text-muted-foreground">{role.name}</span>
                <div className="flex-1">
                  <RoleCombobox
                    roleId={role.id}
                    currentName={assignments[role.id] ?? ""}
                    persons={persons}
                    onChange={(name) => setAssignments((prev) => ({ ...prev, [role.id]: name }))}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          {!isVirtual && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting || saving}
            >
              <Trash2 className="mr-1 size-4" />
              Hapus Layanan
            </Button>
          )}
          <div className="flex gap-2 sm:ml-auto">
            <Button variant="outline" onClick={onClose} disabled={saving || deleting}>
              Tutup
            </Button>
            <Button onClick={handleSave} disabled={saving || deleting}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
