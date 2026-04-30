export type Bait = {
  title: string
  content: string
}

export type SongData = {
  id: string
  title: string
  baits: Bait[]
  isReffEnabled: boolean
  reff: Bait
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
  const reffTitle = song.reff?.title.trim() || song.title
  const reffRows = song.isReffEnabled ? buildRows(song.reff?.content ?? '') : []
  for (const bait of song.baits) {
    const baitRows = buildRows(bait.content)
    if (baitRows.length === 0) continue
    const t = bait.title.trim() || song.title
    for (const row of baitRows) {
      lines.push(`${escape(t)},${escape(row.join('\n'))}`)
    }
    for (const row of reffRows) {
      lines.push(`${escape(reffTitle)},${escape(row.join('\n'))}`)
    }
  }
  return lines.join('\n')
}

export function emptySong(id: string): SongData {
  return {
    id,
    title: '',
    baits: [{ title: '', content: '' }],
    isReffEnabled: false,
    reff: { title: '', content: '' },
  }
}
