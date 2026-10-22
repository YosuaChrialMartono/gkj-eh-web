"use client"
import { useState } from "react"
import { Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { PelayanPerson } from "@/lib/types"
import { createPelayanPerson, removePelayanPerson } from "@/lib/server/pelayan/actions"

export function PersonManager({ initialPersons }: { initialPersons: PelayanPerson[] }) {
  const [persons, setPersons] = useState(initialPersons)
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)
  async function add() {
    setBusy(true)
    const result = await createPelayanPerson(name)
    setBusy(false)
    if (!result.ok) return toast.error(result.error.message)
    setPersons((current) => current.some((person) => person.id === result.data.id) ? current : [...current, result.data].sort((a, b) => a.name.localeCompare(b.name)))
    setName("")
  }
  async function remove(id: string) {
    const result = await removePelayanPerson(id)
    if (!result.ok) return toast.error(result.error.message)
    setPersons((current) => current.filter((person) => person.id !== id))
  }
  return <section className="flex flex-col gap-3"><h2 className="font-medium">Daftar pelayan</h2><div className="flex gap-2"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama pelayan" /><Button onClick={add} disabled={busy || !name.trim()}><Plus className="mr-1 size-4" />Tambah</Button></div><ul className="divide-y rounded-md border">{persons.map((person) => <li key={person.id} className="flex items-center justify-between px-3 py-2 text-sm">{person.name}<Button variant="ghost" size="icon" aria-label={`Hapus ${person.name}`} onClick={() => remove(person.id)}><Trash2 className="size-4" /></Button></li>)}</ul></section>
}
