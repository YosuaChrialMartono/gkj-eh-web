# Multi-Song Project Design

## Overview

Add a "project" concept to the title-converter page so users can manage multiple songs at once, then download each song's CSV individually or all songs together as a zip.

## Data Shape

```ts
type SongData = {
  id: string                      // uuid, used as React key
  judulLagu: string
  jumlahBait: number
  isReffEnabled: boolean
  inputs: Record<string, string>  // 'reff', 'bait-0', 'bait-1', ...
}
```

## page.tsx

- Holds `songs: SongData[]`, initialised with one empty song.
- "Tambah Lagu" button appends a new empty `SongData`.
- Passes each song's data and a per-field change handler down to `SongCard`.
- "Download Semua (ZIP)" button iterates all songs, generates a CSV per song using `jszip`, and downloads `export.zip`.

## SongCard changes

- Removes internal state; receives `SongData` and `onChange(field, value)` as props.
- `buildRows`, `toTitleCase`, and `outputSections` logic stays inside the component.
- Per-song "Export CSV" button triggers CSV generation and download inline.

## Dependencies

- Add `jszip` via pnpm for zip creation.

## Files changed

- `components/title-converter/song-card.tsx` — convert to controlled component
- `app/title-converter/page.tsx` — add project state and zip export logic
