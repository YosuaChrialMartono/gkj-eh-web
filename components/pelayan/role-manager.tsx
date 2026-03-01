"use client"

import { useState } from "react"
import { Trash2, ArrowUp, ArrowDown, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth/auth-context"
import type { PelayanRole } from "@/lib/types"

interface RoleManagerProps {
  initialRoles: PelayanRole[]
}

type DraftRole = PelayanRole | { id: "__new__"; name: string; order: number }

function isDraft(r: DraftRole): r is { id: "__new__"; name: string; order: number } {
  return r.id === "__new__"
}

export function RoleManager({ initialRoles }: RoleManagerProps) {
  const { accessToken } = useAuth()
  const [roles, setRoles] = useState<DraftRole[]>(
    [...initialRoles].sort((a, b) => a.order - b.order)
  )

  async function handleBlur(index: number) {
    const role = roles[index]
    if (!role.name.trim()) return

    if (isDraft(role)) {
      // Create
      try {
        const res = await fetch("/api/pelayan/roles", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ name: role.name, order: role.order }),
        })
        if (!res.ok) throw new Error("Gagal menyimpan peran")
        const created = await res.json() as PelayanRole
        setRoles((prev) => prev.map((r, i) => (i === index ? created : r)))
        toast.success("Peran ditambahkan")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Terjadi kesalahan")
      }
    } else {
      // Update
      try {
        const res = await fetch(`/api/pelayan/roles/${role.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ name: role.name, order: role.order }),
        })
        if (!res.ok) throw new Error("Gagal memperbarui peran")
        const updated = await res.json() as PelayanRole
        setRoles((prev) => prev.map((r, i) => (i === index ? updated : r)))
        toast.success("Peran diperbarui")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Terjadi kesalahan")
      }
    }
  }

  async function handleDelete(index: number) {
    const role = roles[index]
    if (isDraft(role)) {
      setRoles((prev) => prev.filter((_, i) => i !== index))
      return
    }
    try {
      const res = await fetch(`/api/pelayan/roles/${role.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok && res.status !== 204) throw new Error("Gagal menghapus peran")
      setRoles((prev) => prev.filter((_, i) => i !== index))
      toast.success("Peran dihapus")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan")
    }
  }

  async function moveRole(index: number, direction: -1 | 1) {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= roles.length) return

    const next = [...roles]
    const a = next[index]
    const b = next[newIndex]
    next[index] = { ...b, order: a.order }
    next[newIndex] = { ...a, order: b.order }
    setRoles(next)

    // Persist new orders
    const toUpdate = [next[index], next[newIndex]].filter((r) => !isDraft(r)) as PelayanRole[]
    try {
      await Promise.all(
        toUpdate.map((r) =>
          fetch(`/api/pelayan/roles/${r.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify({ name: r.name, order: r.order }),
          })
        )
      )
    } catch {
      toast.error("Gagal memperbarui urutan")
    }
  }

  function addNew() {
    const maxOrder = roles.reduce((m, r) => Math.max(m, r.order), 0)
    setRoles((prev) => [...prev, { id: "__new__", name: "", order: maxOrder + 1 }])
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {roles.length === 0 && (
          <p className="text-sm text-muted-foreground">Belum ada peran. Tambahkan di bawah.</p>
        )}
        {roles.map((role, index) => (
          <div key={`${role.id}-${index}`} className="flex items-center gap-2">
            <Input
              className="flex-1"
              placeholder="Nama peran"
              value={role.name}
              onChange={(e) =>
                setRoles((prev) =>
                  prev.map((r, i) => (i === index ? { ...r, name: e.target.value } : r))
                )
              }
              onBlur={() => handleBlur(index)}
            />
            <Button
              variant="ghost"
              size="icon"
              disabled={index === 0}
              onClick={() => moveRole(index, -1)}
              aria-label="Pindah ke atas"
            >
              <ArrowUp className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={index === roles.length - 1}
              onClick={() => moveRole(index, 1)}
              aria-label="Pindah ke bawah"
            >
              <ArrowDown className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => handleDelete(index)}
              aria-label="Hapus peran"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-fit" onClick={addNew}>
        <Plus className="mr-1 size-4" />
        Tambah Peran
      </Button>
    </div>
  )
}
