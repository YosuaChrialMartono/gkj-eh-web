export type SongData = {
  id: string
  judulLagu: string
  jumlahBait: number
  isReffEnabled: boolean
  inputs: Record<string, string>
}

export function toTitleCase(s: string): string {
  const string = s.trim().split(/\s+/)
  return [
    ...string.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
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
  return { id, judulLagu: '', jumlahBait: 1, isReffEnabled: false, inputs: {} }
}
