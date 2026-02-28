# Multi-Song Project Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow users to manage multiple songs in one session and download each song's CSV individually or all songs together as a zip.

**Architecture:** Lift all song state from `SongCard` to `page.tsx` as an array of `SongData` objects. Extract shared helpers and types to `lib/title-converter.ts`. Install `jszip` for zip export.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, jszip

---

### Task 1: Install jszip

**Files:**
- Modify: `package.json` (via pnpm)

**Step 1: Install jszip**

```bash
pnpm add jszip
```

**Step 2: Verify install**

```bash
pnpm list jszip
```
Expected: jszip listed as a dependency.

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add jszip for zip export"
```

---

### Task 2: Create shared types and utilities in `lib/title-converter.ts`

Move `toTitleCase`, `buildRows`, and the CSV generator out of `song-card.tsx` into a shared lib file so both `SongCard` and `page.tsx` can use them.

**Files:**
- Create: `lib/title-converter.ts`

**Step 1: Create the file**

```ts
export type SongData = {
  id: string
  judulLagu: string
  jumlahBait: number
  isReffEnabled: boolean
  inputs: Record<string, string>
}

export function toTitleCase(s: string): string {
  const [first, ...rest] = s.trim().split(/\s+/)
  if (!first) return s
  return [
    first.toUpperCase(),
    ...rest.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
  ].join(' ')
}

export function buildRows(text: string): string[][] {
  const rawLines = text.split('\n').filter(l => l.trim())
  const normalizedLines: string[] = []
  for (const raw of rawLines) {
    const words = raw.trim().split(/\s+/).filter(Boolean)
    if (words.length > 7) {
      for (let i = 0; i < words.length; i += 7) {
        normalizedLines.push(words.slice(i, i + 7).join(' '))
      }
    } else {
      normalizedLines.push(raw.trim())
    }
  }
  const rows: string[][] = []
  for (let i = 0; i < normalizedLines.length; i += 2) {
    rows.push(
      i + 1 < normalizedLines.length
        ? [normalizedLines[i], normalizedLines[i + 1]]
        : [normalizedLines[i]]
    )
  }
  return rows
}

export function generateCsvContent(song: SongData): string {
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`
  const lines = ['Judul Title,Isi lagu']
  for (let i = 0; i < song.jumlahBait; i++) {
    const baitRows = buildRows(song.inputs[`bait-${i}`] ?? '')
    for (const row of baitRows) {
      lines.push(`${escape(`${toTitleCase(song.judulLagu)}: ${i + 1}`)},${escape(row.join('\n'))}`)
    }
    if (song.isReffEnabled) {
      const reffRows = buildRows(song.inputs['reff'] ?? '')
      for (const row of reffRows) {
        lines.push(`${escape(`${toTitleCase(song.judulLagu)}: Reff`)},${escape(row.join('\n'))}`)
      }
    }
  }
  return lines.join('\n')
}

export function emptySong(id: string): SongData {
  return { id, judulLagu: '', jumlahBait: 0, isReffEnabled: false, inputs: {} }
}
```

**Step 2: Commit**

```bash
git add lib/title-converter.ts
git commit -m "feat: add SongData type and shared CSV/row utilities"
```

---

### Task 3: Refactor `SongCard` to a controlled component

Remove all `useState` hooks from `SongCard`. It now receives `song: SongData` and `onUpdate: (patch: Partial<Omit<SongData, 'id'>>) => void` as props. Import helpers from `lib/title-converter.ts`.

**Files:**
- Modify: `components/title-converter/song-card.tsx`

**Step 1: Replace the file content**

```tsx
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
  onUpdate: (patch: Partial<Omit<SongData, 'id'>>) => void
}

export default function SongCard({ song, onUpdate }: SongCardProps) {
  const { judulLagu, jumlahBait, isReffEnabled, inputs } = song

  const handleInputChange = (key: string, value: string) => {
    onUpdate({ inputs: { ...inputs, [key]: value } })
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
      const baitRows = buildRows(inputs[`bait-${i}`] ?? '')
      sections.push({
        key: `bait-${i}`,
        title: `Bait ${i + 1}`,
        rows: baitRows.map(lines => ({
          rowNum: ++rowCounter,
          label: `${toTitleCase(judulLagu)}: ${i + 1}`,
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
            label: `${toTitleCase(judulLagu)}: Reff`,
            lines,
          })),
        })
      }
    }
    return sections
  }, [inputs, jumlahBait, judulLagu, isReffEnabled])

  return (
    <div className="grid w-full gap-3">
      <div className="flex flex-col gap-2 w-full items-center">
        <div className="flex w-full gap-3 items-center">
          <div className="flex flex-col gap-3 justify-start w-1/12">
            <Label>Jumlah Bait</Label>
            <Input
              placeholder="3"
              className="w-full"
              value={jumlahBait || ''}
              onChange={(e) => onUpdate({ jumlahBait: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="flex flex-col gap-3 justify-start w-full">
            <Label>Judul Lagu</Label>
            <Input
              placeholder="KJ 3:303"
              className="w-full"
              value={judulLagu}
              onChange={(e) => onUpdate({ judulLagu: e.target.value })}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 w-full">
          <Checkbox
            checked={isReffEnabled}
            onClick={() => onUpdate({ isReffEnabled: !isReffEnabled })}
          />
          <span className="w-max">Dengan reff</span>
        </div>
      </div>
      {judulLagu && jumlahBait ? (
        <div className="flex flex-col gap-3 mt-3">
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
                  className="h-32 resize-none overflow-y-auto"
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
                  className="h-32 resize-none overflow-y-auto"
                />
              </div>
              {isReffEnabled && (
                <Input readOnly value={'Reff'} className="w-full" />
              )}
            </Fragment>
          ))}
          <Separator className="my-3" />
          <span className="font-bold">Hasil</span>
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
          <Button onClick={handleExportCsv} className="w-full mt-2 cursor-pointer">
            Export CSV
          </Button>
        </div>
      ) : null}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/title-converter/song-card.tsx
git commit -m "refactor: convert SongCard to controlled component"
```

---

### Task 4: Update `page.tsx` with project state and zip export

**Files:**
- Modify: `app/title-converter/page.tsx`

**Step 1: Replace the file content**

```tsx
"use client"

import { useState } from "react"
import { v4 as uuidv4 } from 'uuid' // NOTE: use crypto.randomUUID() instead — no extra dep
import SongCard from "@/components/title-converter/song-card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SongData, emptySong, generateCsvContent } from "@/lib/title-converter"
import JSZip from "jszip"

export default function Page() {
  const [songs, setSongs] = useState<SongData[]>([emptySong(crypto.randomUUID())])

  const updateSong = (id: string, patch: Partial<Omit<SongData, 'id'>>) => {
    setSongs(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))
  }

  const addSong = () => {
    setSongs(prev => [...prev, emptySong(crypto.randomUUID())])
  }

  const handleDownloadAll = async () => {
    const zip = new JSZip()
    for (const song of songs) {
      const csv = generateCsvContent(song)
      const filename = `${song.judulLagu || 'lagu'}.csv`
      zip.file(filename, csv)
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'export.zip'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min p-4 flex flex-col gap-6">
      {songs.map((song, index) => (
        <div key={song.id} className="flex flex-col gap-2">
          {index > 0 && <Separator />}
          <SongCard
            song={song}
            onUpdate={(patch) => updateSong(song.id, patch)}
          />
        </div>
      ))}
      <div className="flex gap-2 mt-2">
        <Button variant="outline" onClick={addSong} className="cursor-pointer">
          Tambah Lagu
        </Button>
        <Button onClick={handleDownloadAll} className="cursor-pointer">
          Download Semua (ZIP)
        </Button>
      </div>
    </div>
  )
}
```

**Step 2: Verify the app builds without errors**

```bash
pnpm build
```

Expected: Build succeeds with no TypeScript errors.

**Step 3: Commit**

```bash
git add app/title-converter/page.tsx
git commit -m "feat: add multi-song project with zip export"
```

---

### Task 5: Manual verification checklist

- [ ] Page loads with a single empty SongCard
- [ ] Filling in Judul Lagu and Jumlah Bait shows the bait textareas and output section
- [ ] "Tambah Lagu" appends a second SongCard below with its own independent state
- [ ] Typing in one SongCard does not affect the other
- [ ] "Export CSV" on a single SongCard downloads that song's CSV
- [ ] "Download Semua (ZIP)" downloads a zip containing one CSV per song
