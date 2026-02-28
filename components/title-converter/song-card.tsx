"use client"

import { useMemo, Fragment } from "react"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Input } from "../ui/input"
import { Checkbox } from "../ui/checkbox"
import { Separator } from "../ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import {
  SongData,
  toTitleCase,
  buildRows,
  generateCsvContent,
} from "@/lib/title-converter"

type SongCardProps = {
  song: SongData
  onUpdateAction: (patch: Partial<Omit<SongData, 'id'>>) => void
}

export default function SongCard({ song, onUpdateAction }: SongCardProps) {
  const { judulLagu, jumlahBait, isReffEnabled, inputs } = song

  const handleInputChange = (key: string, value: string) => {
    onUpdateAction({ inputs: { ...inputs, [key]: value } })
  }

  const handleExportCsv = () => {
    const csv = generateCsvContent(song)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${judulLagu || 'lagu'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const outputSections = useMemo(() => {
    let rowCounter = 0
    const sections: Array<{
      key: string
      title: string
      rows: Array<{ rowNum: number; label: string; lines: string[] }>
    }> = []
    for (let i = 0; i < jumlahBait; i++) {
      const sanitizedJudulLagu = judulLagu.replaceAll("“", "\"").replaceAll("”", "\"")
      const kitabLagu = sanitizedJudulLagu.split("\"").at(0)?.replaceAll(":", "")
      const titleLagu = sanitizedJudulLagu.split("\"").at(1) ?? ""
      console.log(judulLagu.split("\""))
      console.log(titleLagu)
      const baitRows = buildRows(inputs[`bait-${i}`] ?? '')
      sections.push({
        key: `bait-${i}`,
        title: `Bait ${i + 1}`,
        rows: baitRows.map(lines => ({
          rowNum: ++rowCounter,
          label: `${kitabLagu}: ${i + 1} "${toTitleCase(titleLagu)}"`,
          lines,
        })),
      })
      if (isReffEnabled) {
        const reffRows = buildRows(inputs['reff'] ?? '')
        sections.push({
          key: `reff-${i}`,
          title: 'Reff',
          rows: reffRows.map(lines => ({
            rowNum: ++rowCounter,
            label: `${kitabLagu}: Reff "${toTitleCase(titleLagu)}"`,
            lines,
          })),
        })
      }
    }
    return sections
  }, [inputs, jumlahBait, judulLagu, isReffEnabled])

  return (
    <div className="grid grid-cols-2 w-full gap-3 mt-3">
      <div className="flex flex-col gap-2 w-full items-center">
        <div className="flex w-full gap-3 items-center">
          <div className="flex flex-col gap-3 justify-start w-1/12 min-w-28">
            <Label>Jumlah Bait</Label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="3"
              className="w-full"
              value={jumlahBait || ''}
              onChange={(e) => onUpdateAction({ jumlahBait: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="flex flex-col gap-3 justify-start w-full">
            <Label>Judul Lagu</Label>
            <Input
              placeholder="KJ 3:303"
              className="w-full"
              value={judulLagu}
              onChange={(e) => onUpdateAction({ judulLagu: e.target.value })}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 w-full">
          <Checkbox
            checked={isReffEnabled}
            onClick={() => onUpdateAction({ isReffEnabled: !isReffEnabled })}
          />
          <span className="w-max">Dengan reff</span>
        </div>
        {judulLagu && jumlahBait ? (
          <div className="flex flex-col gap-3 mt-3 w-full">
            {isReffEnabled && (
              <>
                <span className="font-bold">Reff Lagu</span>
                <div className="w-full flex flex-col gap-3">
                  <div className="flex gap-2 w-full">
                    <Input disabled value={'Reff'} className="w-12.5" readOnly />
                    <Input disabled value={judulLagu} readOnly />
                  </div>
                  <Textarea
                    placeholder="Reff lagu"
                    onChange={(e) => handleInputChange('reff', e.target.value)}
                    value={inputs['reff'] ?? ''}
                    className="h-52 resize-none overflow-y-auto"
                  />
                </div>
                <Separator className="my-3" />
              </>
            )}
            <span className="font-bold">Lirik Lagu</span>
            {Array.from({ length: jumlahBait }, (_, index) => (
              <Fragment key={`bait-${index + 1}-lagu-${judulLagu}`}>
                <div className="w-full flex flex-col gap-3">
                  <div className="flex gap-2 w-full">
                    <Input disabled value={index + 1} className="w-12.5" readOnly />
                    <Input placeholder="Judul lagu" disabled value={judulLagu} readOnly />
                  </div>
                  <Textarea
                    placeholder="Masukkan Lagu/title yang ingin dibuat"
                    onChange={(e) => handleInputChange(`bait-${index}`, e.target.value)}
                    value={inputs[`bait-${index}`] ?? ''}
                    className="h-52 resize-none overflow-y-auto"
                  />
                </div>
                {isReffEnabled && (
                  <Input readOnly value={'Reff'} className="w-full" />
                )}
              </Fragment>
            ))}
          </div>) : null
        }
      </div>
      {judulLagu && jumlahBait ? (
        <div className="flex flex-col gap-3 mt-3">
          <Button onClick={handleExportCsv} className="w-full mt-2 cursor-pointer">
            Export CSV
          </Button>
          <div className="flex flex-col gap-2">
            {outputSections.map(section => (
              <Card key={section.key}>
                <CardHeader className="py-2 px-4">
                  <CardTitle className="text-sm">{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-1 px-4 pb-3">
                  {section.rows.length === 0 ? (
                    <p className="text-muted-foreground text-xs">Belum ada isi</p>
                  ) : (
                    section.rows.map(row => (
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
                    ))
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
