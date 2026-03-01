"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PelayanCell } from "./pelayan-cell"
import { ServiceDetailDialog } from "./service-detail-dialog"
import { mergeServicesWithSundays, isVirtualRow } from "@/lib/pelayan-utils"
import type { ServiceRow } from "@/lib/pelayan-utils"
import type { PelayanRole, PelayanPerson, PelayanService, PelayanAssignment } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PelayanTableProps {
  roles: PelayanRole[]
  services: PelayanService[]
  month: string
  persons: PelayanPerson[]
  assignmentsByService: Record<string, PelayanAssignment[]>
}

function formatDateShort(date: string): string {
  const d = new Date(date + "T00:00:00")
  return d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })
}

export function PelayanTable({ roles, services, month, persons, assignmentsByService: initial }: PelayanTableProps) {
  const [serviceList, setServiceList] = useState<PelayanService[]>(services)
  const [assignmentMap, setAssignmentMap] = useState<Record<string, PelayanAssignment[]>>(initial)
  const [dialogRow, setDialogRow] = useState<ServiceRow | null>(null)

  const rows = mergeServicesWithSundays(serviceList, month)

  function getAssignmentForRole(serviceRow: ServiceRow, roleId: string): PelayanAssignment | undefined {
    if (isVirtualRow(serviceRow)) return undefined
    return assignmentMap[serviceRow.id]?.find((a) => a.roleId === roleId)
  }

  function handleAssigned(assignment: PelayanAssignment, serviceId: string) {
    setAssignmentMap((prev) => {
      const existing = prev[serviceId] ?? []
      const filtered = existing.filter((a) => a.roleId !== assignment.roleId)
      return { ...prev, [serviceId]: [...filtered, assignment] }
    })
  }

  function handleServiceDeleted(date: string) {
    setServiceList((prev) => prev.filter((s) => s.date !== date))
    setAssignmentMap((prev) => {
      const next = { ...prev }
      const svc = serviceList.find((s) => s.date === date)
      if (svc) delete next[svc.id]
      return next
    })
  }

  const dialogAssignments = dialogRow && !isVirtualRow(dialogRow)
    ? (assignmentMap[dialogRow.id] ?? [])
    : []

  return (
    <>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-36 whitespace-nowrap">Tanggal</TableHead>
              {roles.map((role) => (
                <TableHead key={role.id} className="min-w-[140px] whitespace-nowrap">
                  {role.name}
                </TableHead>
              ))}
              <TableHead className="w-20">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={roles.length + 2} className="text-center text-muted-foreground">
                  Tidak ada data ibadah.
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => {
              const virtual = isVirtualRow(row)
              return (
                <TableRow key={row.date} className={cn(virtual && "opacity-60")}>
                  <TableCell className="whitespace-nowrap font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto px-1 py-0.5 text-left font-medium"
                      onClick={() => setDialogRow(row)}
                    >
                      {formatDateShort(row.date)}
                      {!virtual && (row as PelayanService).label && (
                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                          {(row as PelayanService).label}
                        </span>
                      )}
                    </Button>
                  </TableCell>
                  {roles.map((role) => (
                    <TableCell key={role.id} className="p-1">
                      <PelayanCell
                        assignment={getAssignmentForRole(row, role.id)}
                        serviceRow={row}
                        roleId={role.id}
                        persons={persons}
                        onAssigned={(a, svcId) => {
                          // If a virtual row was materialised, add it to serviceList
                          if (virtual) {
                            setServiceList((prev) => [
                              ...prev,
                              { id: svcId, date: row.date, isExtra: false },
                            ])
                          }
                          handleAssigned(a, svcId)
                        }}
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => setDialogRow(row)}
                    >
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {dialogRow && (
        <ServiceDetailDialog
          serviceRow={dialogRow}
          roles={roles}
          persons={persons}
          initialAssignments={dialogAssignments}
          open={!!dialogRow}
          onClose={() => setDialogRow(null)}
          onDeleted={handleServiceDeleted}
        />
      )}
    </>
  )
}
