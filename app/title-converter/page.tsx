"use client"

import { useState } from "react"
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
            onUpdateAction={(patch) => updateSong(song.id, patch)}
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
