"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { assignPelayan, createPelayanPerson } from "@/lib/server/pelayan/actions"
import type { PelayanAssignment, PelayanPerson } from "@/lib/types"
import type { ServiceRow } from "@/lib/pelayan-utils"
import { isVirtualRow } from "@/lib/pelayan-utils"

interface PelayanCellProps {
  assignment: PelayanAssignment | undefined
  serviceRow: ServiceRow
  roleId: string
  persons: PelayanPerson[]
  onAssigned: (assignment: PelayanAssignment, serviceId: string) => void
}

export function PelayanCell({ assignment, serviceRow, roleId, persons, onAssigned }: PelayanCellProps) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const currentName = assignment?.pelayanName ?? ""

  async function handleSelect(name: string) {
    if (!name.trim()) return
    setPending(true)
    setOpen(false)
    try {
      if (!persons.some((person) => person.name.trim().toLowerCase() === name.trim().toLowerCase())) {
        const personResult = await createPelayanPerson(name)
        if (!personResult.ok) throw new Error(personResult.error.message)
      }

      const result = await assignPelayan({ ...(isVirtualRow(serviceRow) ? { date: serviceRow.date } : { serviceId: serviceRow.id }), roleId, pelayanName: name })
      if (!result.ok) throw new Error(result.error.message)
      onAssigned(result.data.assignment, result.data.service.id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setPending(false)
      setInputValue("")
    }
  }

  const filtered = inputValue
    ? persons.filter((p) => p.name.toLowerCase().includes(inputValue.toLowerCase()))
    : persons

  const showAddNew = inputValue.trim() && !persons.some((p) => p.name.toLowerCase() === inputValue.toLowerCase())

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-full justify-between px-2 font-normal", !currentName && "text-muted-foreground")}
          disabled={pending}
        >
          <span className="truncate">{currentName || "—"}</span>
          <ChevronsUpDown className="ml-1 size-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Cari nama..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>Tidak ada hasil.</CommandEmpty>
            <CommandGroup>
              {filtered.map((p) => (
                <CommandItem key={p.id} value={p.name} onSelect={() => handleSelect(p.name)}>
                  <Check className={cn("mr-2 size-4", currentName === p.name ? "opacity-100" : "opacity-0")} />
                  {p.name}
                </CommandItem>
              ))}
              {showAddNew && (
                <CommandItem value={`__new__${inputValue}`} onSelect={() => handleSelect(inputValue)}>
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
