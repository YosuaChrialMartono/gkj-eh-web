"use client"

import { useMemo, Fragment } from "react"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { Separator } from "../ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { X } from "lucide-react"
import { Bait, SongData, buildRows, emptySong, generateCsvContent } from "@/lib/title-converter"

type SongCardProps = {
  song: SongData
  onUpdateAction: (patch: Partial<Omit<SongData, 'id'>>) => void
}

export default function SongCard({ song, onUpdateAction }: SongCardProps) {
  const title = song.title ?? ''
  const baits: Bait[] = song.baits ?? emptySong('').baits
  const isReffEnabled = song.isReffEnabled ?? false
  const reff: Bait = song.reff ?? { title: '', content: '' }

  const updateBait = (i: number, patch: Partial<Bait>) => {
    const next = baits.map((b, idx) => (idx === i ? { ...b, ...patch } : b))
    onUpdateAction({ baits: next })
  }

  const addBait = () => {
    onUpdateAction({ baits: [...baits, { title: '', content: '' }] })
  }

  const removeBait = (i: number) => {
    if (baits.length <= 1) return
    onUpdateAction({ baits: baits.filter((_, idx) => idx !== i) })
  }

  const updateReff = (patch: Partial<Bait>) => {
    onUpdateAction({ reff: { ...reff, ...patch } })
  }

  const handleExportCsv = () => {
    const csv = generateCsvContent(song)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || 'lagu'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const previewSections = useMemo(() => {
    let rowCounter = 0
    const reffTitle = reff.title.trim() || title
    const reffRows = isReffEnabled ? buildRows(reff.content) : []
    const sections: Array<{
      key: string
      heading: string
      rows: Array<{ rowNum: number; label: string; lines: string[] }>
    }> = []
    baits.forEach((bait, i) => {
      const baitRows = buildRows(bait.content)
      if (baitRows.length === 0) return
      const t = bait.title.trim() || title
      sections.push({
        key: `bait-${i}`,
        heading: `Bait ${i + 1}`,
        rows: baitRows.map(lines => ({
          rowNum: ++rowCounter,
          label: t,
          lines,
        })),
      })
      if (reffRows.length > 0) {
        sections.push({
          key: `reff-${i}`,
          heading: 'Reff',
          rows: reffRows.map(lines => ({
            rowNum: ++rowCounter,
            label: reffTitle,
            lines,
          })),
        })
      }
    })
    return sections
  }, [baits, isReffEnabled, reff, title])

  return (
    <div className="grid grid-cols-2 w-full gap-3 mt-3">
      <div className="flex flex-col w-full gap-3">
        <div className="flex flex-col gap-2 w-full">
          <Label>Title</Label>
          <Input
            placeholder="Judul"
            value={title}
            onChange={(e) => onUpdateAction({ title: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id={`reff-${song.id}`}
            checked={isReffEnabled}
            onCheckedChange={(v) => onUpdateAction({ isReffEnabled: !!v })}
          />
          <Label htmlFor={`reff-${song.id}`} className="cursor-pointer">Dengan reff</Label>
        </div>

        {isReffEnabled && (
          <div className="flex flex-col gap-2 w-full">
            <Label>Reff</Label>
            <Input
              placeholder={title || 'Judul reff'}
              value={reff.title}
              onChange={(e) => updateReff({ title: e.target.value })}
            />
            <Textarea
              placeholder="Isi reff"
              value={reff.content}
              onChange={(e) => updateReff({ content: e.target.value })}
              className="h-40 resize-none overflow-y-auto"
            />
          </div>
        )}

        <Separator />

        {baits.map((bait, i) => (
          <Fragment key={i}>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center justify-between">
                <Label>Bait {i + 1}</Label>
                {baits.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBait(i)}
                    className="h-7 px-2 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Input
                placeholder={title || 'Judul bait'}
                value={bait.title}
                onChange={(e) => updateBait(i, { title: e.target.value })}
              />
              <Textarea
                placeholder={`Isi bait ${i + 1}`}
                value={bait.content}
                onChange={(e) => updateBait(i, { content: e.target.value })}
                className="h-40 resize-none overflow-y-auto"
              />
            </div>
          </Fragment>
        ))}

        <div className="flex gap-2">
          <Button variant="outline" onClick={addBait} className="cursor-pointer">
            Tambah Bait
          </Button>
          <Button onClick={handleExportCsv} className="cursor-pointer flex-1">
            Export CSV
          </Button>
        </div>
      </div>

      {previewSections.length > 0 && (
        <div className="flex flex-col gap-2 mt-3">
          {previewSections.map(section => (
            <Card key={section.key}>
              <CardHeader className="py-2 px-4">
                <CardTitle className="text-sm">{section.heading}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 px-4 pb-3">
                {section.rows.map(row => (
                  <div key={row.rowNum} className="flex gap-3 items-start">
                    <span className="text-muted-foreground text-xs w-5 shrink-0 mt-0.5">
                      {row.rowNum}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                      {row.label}
                    </span>
                    <div className="flex flex-col min-w-0">
                      {row.lines.map((line, i) => (
                        <span key={i} className="truncate text-sm">{line}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
